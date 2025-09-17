'use server'

import { appwriteConfig } from "./config";
import {Account, Avatars, Client, Databases, Storage, Users} from "node-appwrite"
import { cookies } from "next/headers";

export const createSessionClient = async () => {
    const client = new Client().setEndpoint(appwriteConfig.endpointUrl).setProject(appwriteConfig.projectId)

    const session = ((await cookies()).get('appwrite-session'))
    if(!session || !session.value) throw new Error('no session')

    client.setSession(session.value)

    return {
        get account(){
            return new Account(client)
        },
        get databases(){
            return new Databases(client)
        }
    }
}

export const createAdminClient = async () => {
    const client = new Client().setEndpoint(appwriteConfig.endpointUrl).setProject(appwriteConfig.projectId).setKey(appwriteConfig.secretId)

    return {
        get account(){
            return new Account(client)
        },
        get databases(){
            return new Databases(client)
        },
        get users(){
            return new Users(client)
        },
        get storage(){
            return new Storage(client)
        },
        get avatar(){
            return new Avatars(client)
        }

    }
}
