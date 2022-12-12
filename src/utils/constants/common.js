const statusCodes = {
    PROCESSING: 102,
    OK: 200,
    CREATED: 201,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UPGRADE_REQUIRED: 426,
    SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
    CONFLICT: 409
};

module.exports.serverMessages = {
    NOT_FOUND: 'Record not found',
    SERVER_ERROR: 'Something abnormal happened!',
    DELETE_SUCCESS: 'Record successfully deleted!',
    CREATE_SUCCESS: 'Record successfully created!',
    UPDATE_SUCCESS: 'Record successfully updated!',
    UPDATE_FAILURE: 'Can not update the record!',
    CREATE_FAILURE: 'Can not create the record!',
    REMOVE_SUCCESS: 'Record successfully removed!',
    REMOVE_FAILURE: 'Can not remove the record!',
    SUCCESS: 'Success',
    APP_ID_REQUIRED: 'App id is required',
    UNAUTHORIZED: 'Not authorized'
}

module.exports.statusCodes = statusCodes;