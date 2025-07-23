import { PUBLIC_API_ENDPOINT } from "$env/static/public";
import PocketBase from "pocketbase";

export const pocketbase = new PocketBase(PUBLIC_API_ENDPOINT);