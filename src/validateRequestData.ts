import { ClassConstructor, plainToClass } from "class-transformer";
import { validate } from "class-validator";
import * as functions from "firebase-functions";
import { Response } from "express";

/**
 * @description Validate request data and throw a functions https error when data is invalid
 * @param requestClass The class with class-validator validation
 * @param request The request object from the client
 * @param throwExpressError Optional express "res" object. If given, throw an express error instead of a functions error
 */
export async function validateRequestData(
    requestClass: ClassConstructor<any>,
    request: unknown,
    throwExpressError?: Response
): Promise<void | Response> {
    /**
     * Throw https error when request data is not an object
     * Only needed when using onCall requests (express always sends request data as an object)
     */
    if (!request) throw new functions.https.HttpsError(
        "invalid-argument",
        "Request data must be an object"
    );

    const ptc = plainToClass(requestClass, request);
    const validateData = await validate(ptc);
    const error = validateData.map(value => ({
        property: value.property,
        info: value.constraints
    }));

    /** Return void if no errors */
    if (validateData.length === 0) return;

    /** Optional throw an express error instead of a functions error */
    if (throwExpressError) return throwExpressError.status(400)
        .json({
            error: "Missing or invalid parameter (see details)",
            details: error
        });

    /** Throw a functions https error */
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing or invalid parameter (see error.details)",
        error
    );
}