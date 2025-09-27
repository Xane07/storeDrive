"use server";
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { ID, Models, Query } from "node-appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { constructFileUrl, getFileType, parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCursorRectangle } from "recharts/types/util/cursor/getCursorRectangle";
import { getCurrentUser } from "@/lib/actions/user.actions";
const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();

  try {
    // Ensure required identifiers are present; fall back to session account if missing
    let resolvedAccountId = accountId;
    if (!resolvedAccountId) {
      try {
        const { account } = await createSessionClient();
        const me = await account.get();
        resolvedAccountId = me.$id;
      } catch {}
    }
    if (!resolvedAccountId) {
      throw new Error("Missing accountId for file upload");
    }

    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      file as unknown as File
    );
    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId: resolvedAccountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };
    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "failed to create fie document");
      });
    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

const createQueries = (currentUser: Models.Document) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email])
    ])
  ];
  return queries;
};

export const getFiles = async () => {
  const { databases, storage } = await createAdminClient();
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.user) {
      throw new Error("User not found");
    }
    const queries = createQueries(currentUser.user);
    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries,
    );
    // Backfill size for documents that don't have it by reading from storage
    const documentsWithSize = await Promise.all(
      files.documents.map(async (doc: Models.Document) => {
        if ((doc as any).size === undefined || (doc as any).size === null) {
          try {
            const bucketFile = await storage.getFile(
              appwriteConfig.bucketId,
              (doc as any).bucketFileId
            );
            return parseStringify({ ...doc, size: bucketFile.sizeOriginal });
          } catch (err) {
            console.warn("Failed to fetch file metadata for size", doc.$id, err);
            return doc;
          }
        }
        return doc;
      })
    );
    return { ...files, documents: documentsWithSize } as any;
  } catch (error) {
    console.error("Failed to get files:", error);
    return { documents: [], total: 0 };
  }
};
