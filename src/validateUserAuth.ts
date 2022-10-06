import { CallableContext } from "firebase-functions/lib/common/providers/https";
import * as functions from "firebase-functions";

export function validateUserAuth(context: CallableContext): void {
    if (!context.auth?.uid) throw new functions.https.HttpsError(
        "unauthenticated",
        "No user id"
    );
}