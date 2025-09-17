"use server";

import { Query, ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])]
  );
  return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: String) => {
  console.log(error, message);
  throw error;
};

export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account, users } = await createAdminClient();

  try {
    // Ensure the Appwrite user exists for this email
    let appwriteUserId: string | null = null;
    try {
      const list = await users.list([Query.equal("email", [email])]);
      if (list.total > 0) {
        appwriteUserId = list.users[0].$id;
      }
    } catch {}

    if (!appwriteUserId) {
      appwriteUserId = ID.unique();
      await users.create(appwriteUserId, email);
    }

    const token = await account.createEmailToken(appwriteUserId, email);
    return token.userId;
  } catch (error) {
    handleError(error, "failed to send email OTP");
  }
};

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("failed to send email OTP");

  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar: avatarPlaceholderUrl,
        accountId,
      }
    );
  }

  return parseStringify({ accountId });
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, password);
    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "failed to verify otp");
  }
};

export const getCurrentUser = async () => {
  try {
    const { account, databases } = await createSessionClient();

    const currentAccount = await account.get();

    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("email", [currentAccount.email])]
    );

    const userDocument = users.total > 0 ? users.documents[0] : null;

    return parseStringify({
      user: userDocument,
      account: {
        id: currentAccount.$id,
        email: currentAccount.email,
        name: currentAccount.name,
      },
    });
  } catch (error) {
    return null;
  }
};

export const signOut = async () => {
  const { account } = await createAdminClient();
  try {
    //deleting current session

    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    handleError(error, "failed to sign out");
  } finally {
    redirect("/sign-in");
  }
};

export const signIn = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);
    // if user exists, send OTP and return their accountId
    if (existingUser) {
      await sendEmailOTP({ email });
      return parseStringify({ accountId: existingUser.accountId });
    }
    return parseStringify({ accountId: null, error: "user not found" });
  } catch (error) {
    handleError(error, "failed to sign in the user");
  }
};
