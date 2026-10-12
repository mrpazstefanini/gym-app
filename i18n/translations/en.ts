import { AppMessagesEnum } from "@/shared/enum/AppMessagesEnum";

export const enAppMessages: Record<AppMessagesEnum, string> = {
  //#region General Messages
  [AppMessagesEnum.BACK]: "Back",
  [AppMessagesEnum.TRY]: "Try",
  [AppMessagesEnum.NOT]: "No",
  [AppMessagesEnum.YES]: "Yes",
  [AppMessagesEnum.YES_CANCEL]: "Yes, cancel",
  [AppMessagesEnum.TRY_AGAIN]: "Try Again",
  [AppMessagesEnum.ATTENTION]: "Attention",
  [AppMessagesEnum.OK]: "OK",
  [AppMessagesEnum.INFO]: "Information",
  [AppMessagesEnum.STATUS]: "Status",
  [AppMessagesEnum.ID]: "ID",
  [AppMessagesEnum.LANGUAGE_SELECTOR_LABEL]: "Select Language",
  [AppMessagesEnum.SUCCESS]: "Success",
  [AppMessagesEnum.ERROR]: "Error",
  [AppMessagesEnum.LOADING]: "Loading...",
  [AppMessagesEnum.CANCEL]: "Cancel",
  [AppMessagesEnum.CLOSE]: "Close",
  [AppMessagesEnum.REMOVE]: "Remove",
  [AppMessagesEnum.NO_DATA]: "No data available.",
  [AppMessagesEnum.INVALID_DATA]: "Invalid data provided.",
  [AppMessagesEnum.CONFIRMATION]: "Confirmation",
  [AppMessagesEnum.UNKNOWN]: "Unknown error. Please try again.",
  [AppMessagesEnum.UPLOAD_IMAGE]: "Upload Image",
  [AppMessagesEnum.UPLOAD_VIDEO]: "Upload Video",
  [AppMessagesEnum.UPDATE_VIDEO]: "Update Video",
  [AppMessagesEnum.SAVE]: "Save",
  [AppMessagesEnum.DESCRIPTION]: "Description",
  [AppMessagesEnum.LOCALIZATION]: "Localization",
  [AppMessagesEnum.PHONE]: "Phone",
  [AppMessagesEnum.VIDEO_TOO_LONG]:
    "The selected video is too large. Please choose a video up to 1 minute.",
  [AppMessagesEnum.LOCAL_DATA_BASE_UNAVAILABLE]:
    "Local database service is not available.",
  [AppMessagesEnum.SESSION_EXPIRED]: "Session expired. Please log in again.",
  [AppMessagesEnum.GATEWAY_TIMEOUT]: "Connection error. Please try again.",
  [AppMessagesEnum.USER_ADMINISTRATOR]: "User Administrator",
  [AppMessagesEnum.FREE_ACCOUNT]: "Free Account",
  [AppMessagesEnum.FINALIZE]: "Finalize",
  [AppMessagesEnum.FINISHED]: "Finished",
  [AppMessagesEnum.SEARCH]: "Search",
  [AppMessagesEnum.NOT_DEFINED]: "Not Defined",
  [AppMessagesEnum.RESET]: "Reset",
  [AppMessagesEnum.OF]: "of",
  [AppMessagesEnum.UNIT]: "unit",
  [AppMessagesEnum.CONFIRM_TITLE]: "Confirm",
  [AppMessagesEnum.CONFIRM_TEXT]: "Are you sure you want to proceed?",
  [AppMessagesEnum.INTERNET_CONNECTION_ERROR]:
    "Internet connection error. Please check your connection and try again.",
  [AppMessagesEnum.CARD]: "Card",
  // #endregion General Messages

  // #region calendar
  [AppMessagesEnum.MONTH]: "Month",
  [AppMessagesEnum.YEAR]: "Year",
  // #endregion calendar

  // #region Firebase
  [AppMessagesEnum.FIREBASE_BIG_FILE]:
    "File too large: {{size}}MB. Maximum allowed: {{maxSizeInMB}}MB",
  [AppMessagesEnum.FIREBASE_DELETE_ERROR]: "Error deleting file from Firebase.",
  [AppMessagesEnum.UPDATE]: "Update",
  [AppMessagesEnum.ADD]: "Add",
  [AppMessagesEnum.DELETE]: "Delete",
  [AppMessagesEnum.VISUALIZE]: "Visualize",
  [AppMessagesEnum.EDIT]: "Edit",
  // #endregion Firebase

  // #region Login/Logout Messages
  [AppMessagesEnum.LOGIN_ACCESS_BUTTON]: "Access with Google",
  [AppMessagesEnum.LOGIN_SUCCESS]: "Login successful.",
  [AppMessagesEnum.LOGIN_SUCCESS_MESSAGE]: "You have successfully logged in.",
  [AppMessagesEnum.LOGIN_ERROR]:
    "Login failed. Please check your credentials and try again.",
  [AppMessagesEnum.LOGOUT_SUCCESS]: "Logout successful.",
  [AppMessagesEnum.LOGOUT_ERROR]: "Logout failed.",
  [AppMessagesEnum.LOGOUT_ERROR_MESSAGE]:
    "An error occurred during logout. Please try again later.",
  // #endregion Login/Logout Messages

  // #region Exercise Messages
  [AppMessagesEnum.EXERCISE_NOT_FOUND]: "Exercise not found.",
  [AppMessagesEnum.EXERCISE_REMOVED_SUCCESS]: "Exercise successfully removed.",
  [AppMessagesEnum.EXERCISE_MOBILITY_FIELDS]: "Exercise mobility fields",
  [AppMessagesEnum.EXERCISE_HYPERTROPHY_FIELDS]: "Exercise hypertrophy fields",
  [AppMessagesEnum.EXERCISE_GENERAL_FIELDS]: "Exercise general fields",
  [AppMessagesEnum.EXERCISE_IMAGE_AND_VIDEO_FIELDS]: "Image and video",
  [AppMessagesEnum.REMOVE_EXERCISE_CONFIRMATION]:
    "Are you sure you want to remove this exercise?",
  [AppMessagesEnum.EXERCISE_NAME_LABEL]: "Exercise name",
  [AppMessagesEnum.EXERCISE_ADDED_SUCCESS]: "Exercise successfully added.",
  [AppMessagesEnum.EXERCISE_EDITED_SUCCESS]: "Exercise successfully edited.",
  [AppMessagesEnum.EXERCISE_ADD_BUTTON]: "Add Exercise",
  [AppMessagesEnum.EXERCISE_LIST]: "Exercise List",
  [AppMessagesEnum.EXERCISE_UPDATE]: "Update Exercise",
  [AppMessagesEnum.EXERCISE_SELECT_PLACEHOLDER]: "Select an exercise",
  [AppMessagesEnum.EXERCISE_REMOVE]: "Remove Exercise",
  [AppMessagesEnum.EXERCISE_CREATED_SUCCESS]: "Exercise successfully created.",
  [AppMessagesEnum.EXERCISE_ADD]: "Add Exercise",
  [AppMessagesEnum.EXERCISE_EDIT]: "Edit Exercise",
  // #endregion Exercise Messages

  //#region User Messages
  [AppMessagesEnum.USER_ID_NOT_FOUND]: "User ID not found.",
  [AppMessagesEnum.USER_NAME_LABEL]: "User name",
  [AppMessagesEnum.USER_EMAIL_LABEL]: "User email",
  [AppMessagesEnum.USER_PHONE_LABEL]: "User phone",
  [AppMessagesEnum.USER_CREATED_SUCCESS]: "User successfully created.",
  [AppMessagesEnum.USER_EDITED_SUCCESS]: "User successfully edited.",
  [AppMessagesEnum.USER_REMOVED_SUCCESS]: "User successfully removed.",
  [AppMessagesEnum.USER_LIST]: "User List",
  [AppMessagesEnum.USER_ADD_BUTTON]: "Add User",
  [AppMessagesEnum.USER_UPDATE]: "Update User",
  [AppMessagesEnum.USER_SELECT_PLACEHOLDER]: "Select a user",
  [AppMessagesEnum.USER_REMOVE]: "Remove User",
  [AppMessagesEnum.USER_REMOVE_CONFIRMATION]:
    "Are you sure you want to remove this user?",
  [AppMessagesEnum.USER_NOT_FOUND]: "User not found.",
  [AppMessagesEnum.USER_ADD]: "Add User",
  [AppMessagesEnum.USER_EDIT]: "Edit User",
  // #endregion User Messages

  // #region ExerciseByUser Messages
  [AppMessagesEnum.NO_EXERCISE_FOR_USER]: "No exercise found for the user.",
  [AppMessagesEnum.EXERCISE_ID_NOT_FOUND]: "Exercise ID not found.",
  [AppMessagesEnum.USER_EXERCISE_NOT_FOUND]: "User exercise not found.",
  [AppMessagesEnum.USER_EXERCISE_REMOVED_SUCCESS]:
    "Exercise successfully removed from user.",
  [AppMessagesEnum.USER_EXERCISE_REMOVE_CONFIRMATION]:
    "Are you sure you want to remove this exercise from the user?",
  [AppMessagesEnum.USER_EXERCISE_EDITED_SUCCESS]:
    "User exercise successfully edited.",
  [AppMessagesEnum.USER_EDIT_TRAINING_TO_USER_BUTTON]: "Edit training to user",
  [AppMessagesEnum.USER_ADD_TRAINING_TO_USER_BUTTON]: "Add training to user",
  [AppMessagesEnum.TRAINING_BY_USER_UPDATED_SUCCESS]:
    "Training successfully updated to user.",
  [AppMessagesEnum.TRAINING_BY_USER_ADDED_SUCCESS]:
    "Training successfully added to user.",
  [AppMessagesEnum.USER_EXERCISE_LIST]: "User Exercise List",
  [AppMessagesEnum.USER_EXERCISE_UPDATE]: "Update User Exercise",
  [AppMessagesEnum.USER_EXERCISE_DISTANCE_LABEL]: "Distance",
  [AppMessagesEnum.USER_EXERCISE_DISTANCE_UNIT_LABEL]: "Distance Unit",
  [AppMessagesEnum.USER_EXERCISE_DURATION_LABEL]: "Duration",
  [AppMessagesEnum.USER_EXERCISE_WEIGHT_LABEL]: "Weight (kg)",
  [AppMessagesEnum.USER_EXERCISE_WEIGHT]: "Weight",

  [AppMessagesEnum.USER_EXERCISE_SETS_LABEL]: "Sets",
  [AppMessagesEnum.USER_EXERCISE_SHORT_DESCRIPTION_LABEL]:
    "Exercise Description",
  [AppMessagesEnum.USER_EXERCISE_GOAL_LABEL]: "Goal",
  [AppMessagesEnum.USER_EXERCISE_REPETITIONS_LABEL]: "Repetitions",
  [AppMessagesEnum.TRAINING_BY_USER_CONFIRM_SAVE]:
    "Are you sure you want to save the changes to the user's trainings?",
  [AppMessagesEnum.TRAINING_BY_USER_CONFIRM_SAVE_TITLE]: "Confirm Save",
  [AppMessagesEnum.TRAINING_BY_USER_NOT_FOUND]: "Training by user not found.",
  [AppMessagesEnum.USER_EXERCISE_ALL_TRAININGS_COMPLETED]:
    "All trainings for this user exercise have been completed.",
  [AppMessagesEnum.USER_EXERCISE_TRAINING_COMPLETED]:
    "Training completed successfully for this exercise.",
  // #endregion ExerciseByUser Messages

  // #region Academy Messages
  [AppMessagesEnum.ACADEMY_ID_NOT_FOUND]: "Academy ID not found.",
  [AppMessagesEnum.ACADEMY_NAME_LABEL]: "Academy name",
  [AppMessagesEnum.ACADEMY_NOT_FOUND]: "Academy not found.",
  [AppMessagesEnum.ACADEMY_REMOVED_SUCCESS]: "Academy successfully removed.",
  [AppMessagesEnum.ACADEMY_REMOVE_CONFIRMATION]:
    "Are you sure you want to remove this academy?",
  [AppMessagesEnum.ACADEMY_EXERCISE_LIST]: "Academy Exercise List",
  [AppMessagesEnum.ACADEMY_LIST]: "Academy List",
  [AppMessagesEnum.ACADEMY_NOT_FOUND_FOR_USER]:
    "No academy found for the user.",
  [AppMessagesEnum.ACADEMY_CREATED_SUCCESS]: "Academy successfully created.",
  [AppMessagesEnum.ACADEMY_EDITED_SUCCESS]: "Academy successfully edited.",
  [AppMessagesEnum.ACADEMY_USER_LIMIT]: "User limit for this academy.",
  [AppMessagesEnum.ACADEMY_REMOVE]: "Remove Academy",
  [AppMessagesEnum.ACADEMY_ADD]: "Add Academy",
  [AppMessagesEnum.ACADEMY_EDIT]: "Edit Academy",
  // #endregion Academy Messages

  // #region training Messages
  [AppMessagesEnum.TRAINING_ID_NOT_FOUND]: "Training ID not found.",
  [AppMessagesEnum.TRAINING_NOT_FOUND]: "Training not found.",
  [AppMessagesEnum.TRAINING_REMOVED_SUCCESS]: "Training successfully removed.",
  [AppMessagesEnum.REMOVE_TRAINING_CONFIRMATION]:
    "Are you sure you want to remove this training?",
  [AppMessagesEnum.TRAINING_NAME_LABEL]: "Training name",
  [AppMessagesEnum.TRAINING_ADDED_SUCCESS]: "Training successfully added.",
  [AppMessagesEnum.TRAINING_EDITED_SUCCESS]: "Training successfully edited.",
  [AppMessagesEnum.TRAINING_ADD_BUTTON]: "Add Training",
  [AppMessagesEnum.TRAINING_LIST]: "Training List",
  [AppMessagesEnum.TRAINING_UPDATE]: "Update Training",
  [AppMessagesEnum.TRAINING_SELECT_PLACEHOLDER]: "Select a training",
  [AppMessagesEnum.TRAINING_REMOVE]: "Remove Training",
  [AppMessagesEnum.TRAINING_EXERCISE_LIST]: "Training Exercise List",
  [AppMessagesEnum.NO_TRAINING_FOR_USER]: "No training found for the user.",
  [AppMessagesEnum.TRAINING_CREATED_SUCCESS]: "Training successfully created.",
  [AppMessagesEnum.TRAINING_REMOVE_CONFIRMATION]:
    "Are you sure you want to remove this training?",
  [AppMessagesEnum.TRAINING_TYPE_LABEL]: "Training Type",
  [AppMessagesEnum.EXERCISE_SCREEN_TITLE]: "Exercise Details",
  [AppMessagesEnum.EXERCISE_HAS_STOPWATCH]: "Includes Stopwatch?",
  [AppMessagesEnum.EXERCISE_HAS_GPS]: "Includes GPS Tracking?",
  [AppMessagesEnum.EXERCISE_SCREEN_FINALIZE_EXERCISE_BUTTON]:
    "Finalize Exercise",
  [AppMessagesEnum.EXERCISE_SCREEN_NO_HISTORY]:
    "No exercise history available.",
  [AppMessagesEnum.USER_EXERCISE_PACE_AVERAGE_LABEL]: "Average Pace",
  [AppMessagesEnum.EXERCISE_SCREEN_FINALIZE_EXERCISE_CONFIRMATION]:
    "Are you sure you want to finalize this exercise?",
  [AppMessagesEnum.EXERCISE_COMPLETED_SUCCESS_MESSAGE]:
    "Exercise completed successfully.",
  [AppMessagesEnum.EXERCISE_SCREEN_FINALIZE_EXERCISES_CONFIRMATION]:
    "Are you sure you want to finalize all exercises?",
  [AppMessagesEnum.EXERCISE_SCREEN_FINALIZE_EXERCISES_BUTTON]:
    "Finalize Exercises",
  [AppMessagesEnum.FINISH_SET_WITHOUT_REST]: "Finish Set Without Rest",
  // #endregion training Messages

  // #region Tabs
  [AppMessagesEnum.TAB_REPORTS]: "Reports",
  [AppMessagesEnum.TAB_CHARTS]: "Charts",
  [AppMessagesEnum.TAB_CARDIO]: "Cardio",
  [AppMessagesEnum.TAB_HOME]: "Home",
  [AppMessagesEnum.TAB_EXERCISES]: "Exercises",
  [AppMessagesEnum.TAB_FINANCIAL]: "Financial",
  [AppMessagesEnum.TAB_CALENDAR]: "Calendar",
  // #endregion Tabs

  // #region Exercise Screen
  [AppMessagesEnum.EXERCISE_SCREEN_HISTORY_TAB]: "History",
  [AppMessagesEnum.EXERCISE_SCREEN_DESCRIPTION_TAB]: "Description",
  [AppMessagesEnum.EXERCISE_SCREEN_EXERCISE_DETAILS_TAB]: "Exercise",
  [AppMessagesEnum.EXERCISE_SCREEN_SERIES]: "Sets",
  [AppMessagesEnum.EXERCISE_SCREEN_REPETITIONS]: "Repetitions",
  [AppMessagesEnum.EXERCISE_SCREEN_GOAL]: "Goal",
  [AppMessagesEnum.EXERCISE_SCREEN_DURATION]: "Duration (in minutes)",
  [AppMessagesEnum.EXERCISE_SCREEN_DISTANCE]: "Distance",
  [AppMessagesEnum.EXERCISE_SCREEN_SET_WEIGHT]:
    "Do you want to change the weight?",
  [AppMessagesEnum.EXERCISE_SCREEN_INITIAL_GPS_BUTTON]: "Start GPS Tracking",
  [AppMessagesEnum.EXERCISE_SCREEN_GPS_METRICS]: "GPS Metrics",
  [AppMessagesEnum.EXERCISE_SCREEN_ELAPSED_TIME_LABEL]: "Elapsed Time",
  [AppMessagesEnum.EXERCISE_SCREEN_SPEED_AVERAGE_LABEL]: "Average Speed",
  [AppMessagesEnum.EXERCISE_SCREEN_HEART_RATE_AVERAGE_LABEL]:
    "Average Heart Rate",
  [AppMessagesEnum.EXERCISE_SCREEN_SET]: "Set",
  // #endregion Exercise Screen

  // #region Groups
  [AppMessagesEnum.DRAWER_NO_GROUPS_FOUND]: "Groups not found.",
  [AppMessagesEnum.DRAWER_ADD_GROUP_TITLE]: "Add Group",
  [AppMessagesEnum.DRAWER_EDIT_GROUP_TITLE]: "Edit Group",
  [AppMessagesEnum.GROUP_NAME]: "Group Name",
  [AppMessagesEnum.GROUP_NAME_EXAMPLE]: "e.g., admin",
  [AppMessagesEnum.GROUP_NOT_FOUND]: "Group not found.",
  [AppMessagesEnum.GROUP_CREATED_SUCCESS]: "Group successfully created.",
  [AppMessagesEnum.GROUP_UPDATED_SUCCESS]: "Group successfully updated.",
  [AppMessagesEnum.GROUP_REMOVED_SUCCESS]: "Group successfully removed.",
  [AppMessagesEnum.CONFIRM_REMOVE_GROUP_TITLE]: "Remove Group",
  [AppMessagesEnum.CONFIRM_REMOVE_GROUP_MESSAGE]:
    "Are you sure you want to remove this group?",
  [AppMessagesEnum.GROUP_LIST]: "Group List",
  // #endregion Groups

  // #region charts
  [AppMessagesEnum.NO_HISTORY_DATA]: "No history data available.",
  [AppMessagesEnum.EXERCISE_SCREEN_HISTORY_CHART_TITLE]:
    "Exercise History Charts",
  [AppMessagesEnum.SHOW_CHART_VALUES]: "Show Chart Values",
  [AppMessagesEnum.TRAININGS]: "Trainings",
  // #endregion charts

  // #region Stopwatch
  [AppMessagesEnum.STOPWATCH_TITLE]: "Stopwatch",
  [AppMessagesEnum.STOPWATCH_START]: "Start",
  [AppMessagesEnum.STOPWATCH_PAUSE]: "Pause",
  [AppMessagesEnum.STOPWATCH_RESET]: "Reset",
  [AppMessagesEnum.STOPWATCH_REST]: "Rest",
  // #endregion Stopwatch

  // #region Drawer Labels
  [AppMessagesEnum.DRAWER_HOME]: "Home",
  [AppMessagesEnum.DRAWER_USER_LIST]: "User List",
  [AppMessagesEnum.DRAWER_ACADEMY_LIST]: "Academy List",
  [AppMessagesEnum.DRAWER_EXERCISE_LIST]: "Exercise List",
  [AppMessagesEnum.DRAWER_TRAINING_LIST]: "Training List",
  [AppMessagesEnum.DRAWER_TRAININGS_BY_USER_LIST]: "User Training List",
  [AppMessagesEnum.DRAWER_LOGOUT]: "Logout",
  [AppMessagesEnum.GROUPS_DRAWER]: "Groups",
  [AppMessagesEnum.DRAWER_NO_USERS_FOUND]: "No users found.",
  [AppMessagesEnum.DRAWER_NO_EXERCISES_FOUND]: "No exercises found.",
  [AppMessagesEnum.DRAWER_NO_ACADEMIES_FOUND]: "No academies found.",
  [AppMessagesEnum.DRAWER_NO_TRAININGS_FOUND]: "No trainings found.",
  [AppMessagesEnum.DRAWER_ADD_EXERCISE_BUTTON_TITLE]: "Add Exercise",
  [AppMessagesEnum.DRAWER_ADD_TRAINING_BUTTON_TITLE]: "Add training",
  [AppMessagesEnum.DRAWER_ADD_USER_BUTTON_TITLE]: "Add User",
  [AppMessagesEnum.DRAWER_USER_SETTINGS]: "User Settings",
  [AppMessagesEnum.CHARTS_DRAWER]: "Charts",
  [AppMessagesEnum.DRAWER_SUBSCRIPTION]: "Subscription",
  [AppMessagesEnum.MY_SUBSCRIPTION]: "My Subscription",
  // #endregion Drawer Labels

  // #region Subscription
  [AppMessagesEnum.SUBSCRIPTION_STATUS_ACTIVE]: "Active",
  [AppMessagesEnum.SUBSCRIPTION_STATUS_CANCELED]: "Canceled",
  [AppMessagesEnum.SUBSCRIPTION_STATUS_PAST_DUE]: "Past Due",
  [AppMessagesEnum.SUBSCRIPTION_STATUS_INCOMPLETE]: "Incomplete",
  [AppMessagesEnum.SUBSCRIPTION_STATUS_UNPAID]: "Unpaid",
  [AppMessagesEnum.SUBSCRIPTION_CANCELING]: "Canceling",
  [AppMessagesEnum.SUBSCRIPTION_STATUS_TRIALING]: "Trialing",
  [AppMessagesEnum.SUBSCRIPTION_PLAN_PREMIUM]: "Premium Plan",
  [AppMessagesEnum.SUBSCRIPTION_START_DATE]: "Start Date",
  [AppMessagesEnum.SUBSCRIPTION_NEXT_BILLING_DATE]: "Next Billing Date",
  [AppMessagesEnum.SUBSCRIPTION_VALID_UNTIL]: "Valid Until",
  [AppMessagesEnum.SUBSCRIPTION_CANCELED_AT]: "Canceled At",
  [AppMessagesEnum.SUBSCRIPTION_CANCEL]: "Cancel Subscription",
  [AppMessagesEnum.SUBSCRIPTION_CANCEL_WARNING]:
    "You will lose access to premium benefits. Are you sure?",
  [AppMessagesEnum.SUBSCRIPTION_RETRY_PAYMENT]: "Retry Payment",
  [AppMessagesEnum.SUBSCRIPTION_UPDATE_CARD]: "Update Card",
  [AppMessagesEnum.SUBSCRIPTION_REACTIVATE]: "Reactivate Subscription",
  [AppMessagesEnum.SUBSCRIPTION_PAST_DUE_WARNING]:
    "Payment overdue. Update your card or try again.",
  [AppMessagesEnum.SUBSCRIPTION_WILL_CANCEL_WARNING]:
    "Your subscription will be canceled on",
  [AppMessagesEnum.SUBSCRIPTION_LOADING]: "Loading subscriptions...",
  [AppMessagesEnum.SUBSCRIPTION_NO_SUBSCRIPTIONS]: "No subscriptions",
  [AppMessagesEnum.SUBSCRIPTION_NO_ACTIVE_SUBSCRIPTIONS]:
    "You do not have any active subscriptions.",
  [AppMessagesEnum.SUBSCRIPTION_SUBSCRIBE_NOW]: "Subscribe Now",
  [AppMessagesEnum.SUBSCRIPTION_UPDATE_CARD_DESCRIPTION]:
    "Enter the new credit card details",
  [AppMessagesEnum.SUBSCRIPTION_START_PAYMENT]: "Start Payment",
  [AppMessagesEnum.SUBSCRIPTION_CARD_DATA]: "Card Data",
  [AppMessagesEnum.SUBSCRIPTION_AUTO_RENEW]: "Automatic Monthly Billing",
  [AppMessagesEnum.SUBSCRIPTION_CANCEL_ANYTIME]: "Cancel Anytime",
  [AppMessagesEnum.SUBSCRIPTION_FIRST_MONTH]: "First Month",
  [AppMessagesEnum.SUBSCRIPTION_TEST_ENVIRONMENT]: "Test Environment",
  [AppMessagesEnum.SUBSCRIPTION_CONFIRM_SUBSCRIPTION]: "Confirm Subscription",
  [AppMessagesEnum.SUBSCRIPTION_USE_CARD_DATA]: "Use the test card",
  [AppMessagesEnum.SUBSCRIPTION_SETUP_INTENT_SUCCESS]:
    "Setup Intent created successfully. Now fill in the card details.",
  [AppMessagesEnum.SUBSCRIPTION_SETUP_INTENT_ERROR_MESSAGE]:
    "Error initiating payment. Please try again.",
  [AppMessagesEnum.SUBSCRIPTION_CLICK_START_PAYMENT_FIRST]:
    "Click 'Start Payment' first",
  [AppMessagesEnum.SUBSCRIPTION_FILL_CARD_DATA]: "Fill in all the card details",
  [AppMessagesEnum.SUBSCRIPTION_CARD_ERROR]: "Card error.",
  [AppMessagesEnum.SUBSCRIPTION_NOT_POSSIBLE_TO_PROCESS_CARD]:
    "It was not possible to process the card.",
  [AppMessagesEnum.SUBSCRIPTION_NOT_POSSIBLE_TO_PROCESS_PAYMENT]:
    "It was not possible to process the payment.",
  [AppMessagesEnum.SUBSCRIPTION_ERROR_TO_SUBSCRIBE]:
    "Error creating subscription.",
  [AppMessagesEnum.SUBSCRIPTION_CREATED]: "Subscription created!",
  [AppMessagesEnum.SUBSCRIPTION_LOAD_ERROR]:
    "Error loading subscriptions. Please try again.",
  [AppMessagesEnum.SUBSCRIPTION_UPDATE_CARD_SUCCESS]:
    "Card updated successfully!",
  [AppMessagesEnum.SUBSCRIPTION_PAYMENT_SUCCESS]:
    "Payment processed successfully!",
  [AppMessagesEnum.SUBSCRIPTION_PAYMENT_PENDING]: "Payment still pending",
  [AppMessagesEnum.SUBSCRIPTION_RETRY_PAYMENT_DESCRIPTION]:
    "Let's try to process the payment again with the current card.",
  [AppMessagesEnum.SUBSCRIPTION_REACTIVATE_TITLE]: "Reactivate Subscription",
  [AppMessagesEnum.SUBSCRIPTION_REACTIVATE_DESCRIPTION]:
    "Do you want to reactivate your premium subscription?",
  [AppMessagesEnum.SUBSCRIPTION_REACTIVATED_SUCCESS]:
    "Subscription reactivated successfully!",
  [AppMessagesEnum.SUBSCRIPTION_CANCELED]:
    "Your subscription has been canceled",
  [AppMessagesEnum.SUBSCRIPTION_PREMIUM_PLAIN]: "Premium Plan",
  [AppMessagesEnum.SUBSCRIBE_NOW]: "Subscribe Now",
  [AppMessagesEnum.SUBSCRIPTION_BILLING_DAY_LABEL]: "Billing Day",
  [AppMessagesEnum.SUBSCRIPTION_BILLING_DAY_SUBLABEL]:
    "Select your preferred billing day",
  [AppMessagesEnum.SUBSCRIPTION_BILLING_DAY_NEXT_DATE]: "Next Billing Date",
  [AppMessagesEnum.SUBSCRIPTION_BILLING_DAY_DAYS_UNTIL]: "days remaining",
  [AppMessagesEnum.SUBSCRIPTION_BILLING_DAY_DAYS]: "days",
  [AppMessagesEnum.SUBSCRIPTION_BILLING_DAY_NO_PRORATION]: "No proration",
  [AppMessagesEnum.SUBSCRIPTION_BILLING_DAY_REQUIRED]:
    "Billing day is required.",
  [AppMessagesEnum.SUBSCRIPTION_PAYMENT_METHOD_NOT_FOUND]:
    "Payment method not found.",
  [AppMessagesEnum.SUBSCRIPTION_CREATED_SUCCESS]:
    "Subscription created successfully!",
  [AppMessagesEnum.BILLING_DAY_UPDATE_TITLE]: "Change Billing Day",
  [AppMessagesEnum.BILLING_DAY_EVERY_DAY]: "Every day",
  [AppMessagesEnum.BILLING_DAY_UPDATE_SUCCESS]:
    "Billing day updated successfully!",
  [AppMessagesEnum.SUBSCRIPTION_BILLING_DAY_SAVE]: "Save new day",
  // #endregion Subscription

  // #region HistoryTab Labels
  [AppMessagesEnum.USER_EXERCISE_COMPLETED_AT_LABEL]: "Completed at",
  [AppMessagesEnum.USER_EXERCISE_NOTES_LABEL]: "My notes",
  [AppMessagesEnum.USER_EXERCISE_COMPLETED_SETS_LABEL]: "Completed Sets",
  [AppMessagesEnum.USER_EXERCISE_COMPLETED_REPETITIONS_LABEL]:
    "Completed Repetitions",
  [AppMessagesEnum.USER_EXERCISE_WEIGHT_USED_LABEL]: "Weight Used (kg)",
  [AppMessagesEnum.USER_EXERCISE_PACE_LABEL]: "Pace",
  [AppMessagesEnum.EXERCISE_SCREEN_TIME]: "Time",
  [AppMessagesEnum.USER_EXERCISE_AVG_HEART_RATE_LABEL]: "Average Heart Rate",
  [AppMessagesEnum.USER_EXERCISE_MAX_HEART_RATE_LABEL]: "Max Heart Rate",
  [AppMessagesEnum.USER_EXERCISE_START_LOCATION_LABEL]: "Start Location",
  [AppMessagesEnum.USER_EXERCISE_END_LOCATION_LABEL]: "End Location",
  [AppMessagesEnum.USER_EXERCISE_ROUTE_POINTS_LABEL]: "Route Points",
  [AppMessagesEnum.USER_EXERCISE_POINTS_LABEL]: "points",
  [AppMessagesEnum.USER_EXERCISE_PERCEIVED_EFFORT_LABEL]: "Perceived Effort",
  [AppMessagesEnum.USER_EXERCISE_FEELING_SCORE_LABEL]: "Feeling Score",
  [AppMessagesEnum.USER_EXERCISE_AVG_REPETITIONS_LABEL]: "Average Repetitions",
  [AppMessagesEnum.USER_EXERCISE_COMPLETED_LABEL]: "Completed",
  [AppMessagesEnum.YES_LABEL]: "Yes",
  [AppMessagesEnum.NO_LABEL]: "No",
  [AppMessagesEnum.USER_EXERCISE_PARTIALLY_COMPLETED_LABEL]:
    "Partially Completed",
  [AppMessagesEnum.USER_EXERCISE_REST_TIME_BETWEEN_SETS_LABEL]:
    "Rest Time Between Sets (in seconds)",
  [AppMessagesEnum.EXERCISE_REST_TIME_BETWEEN_SETS]: "Rest Time Between Sets",
  [AppMessagesEnum.USER_EXERCISE_USER_NOTES_LABEL]: "User Notes",
  [AppMessagesEnum.USER_EXERCISE_FINISH_TRAIN]: "Finalize training",
  [AppMessagesEnum.USER_EXERCISE_HAS_NOTES_LABEL]: "Includes User Notes?",
  [AppMessagesEnum.USER_NOT_AUTHENTICATED]: "User not authenticated.",
  // #endregion HistoryTab Labels

  // #region GPS SCREEN
  [AppMessagesEnum.GPS_ROUTE_HISTORY]: "Route History",
  [AppMessagesEnum.GPS_VIEW_ROUTE]: "View Route",
  [AppMessagesEnum.GPS_SCREEN_TITLE]: "GPS Tracking",
  [AppMessagesEnum.GPS_SCREEN_START_TRACKING_BUTTON]: "Start Tracking",
  [AppMessagesEnum.GPS_SCREEN_STOP_TRACKING_BUTTON]: "Stop Tracking",
  [AppMessagesEnum.GPS_SCREEN_TRACKING_IN_PROGRESS]: "Tracking in progress...",
  [AppMessagesEnum.GPS_SCREEN_NO_LOCATION_PERMISSION]:
    "Location Permission Denied",
  [AppMessagesEnum.GPS_SCREEN_LOCATION_PERMISSION_MESSAGE]:
    "This app requires location access to track your exercise route. Please enable location permissions in your device settings.",
  [AppMessagesEnum.GPS_START]: "Start",
  [AppMessagesEnum.GPS_STOP]: "Stop",
  [AppMessagesEnum.GPS_RACE]: "Race",
  [AppMessagesEnum.GPS_FINALIZE]: "Finalize",
  [AppMessagesEnum.GPS_CONFIRM_FINALIZE_RACE]:
    "Are you sure you want to finalize the race?",
  [AppMessagesEnum.GPS_CURRENT_SPEED_LABEL]: "Current Speed",
  [AppMessagesEnum.GPS_SEARCH_DESTINATION_LABEL]: "Search Destination",
  [AppMessagesEnum.GPS_COMPLETED]: "GPS tracking completed successfully.",
  [AppMessagesEnum.GPS_LOADING_ROUTE]: "Loading route, please wait...",
  [AppMessagesEnum.GPS_CLEAR_ROUTE]: "Clear Route",
  [AppMessagesEnum.GPS_OFF_ROUTE_WARNING]: "You are off the planned route.",
  [AppMessagesEnum.GPS_RECALCULATE_ROUTE_BUTTON]: "Recalculate Route",
  [AppMessagesEnum.GPS_REROUTING_IN_PROGRESS]: "Rerouting in progress...",
  [AppMessagesEnum.CONFIRM_ERASE_GPS_DATA_TITLE]: "Confirm Erase GPS Data",
  [AppMessagesEnum.CONFIRM_ERASE_GPS_DATA_MESSAGE]:
    "When starting a new GPS tracking, the data from the previous tracking will be erased. Are you sure you want to continue?",
  // #endregion GPS SCREEN

  // #region SeriesBetweenSets
  [AppMessagesEnum.SERIES_BETWEEN_SETS_ALL_SERIES_COMPLETED]:
    "All sets completed! ",
  // #endregion SeriesBetweenSets

  // #region Settings
  [AppMessagesEnum.SETTINGS_SCREEN_TITLE]: "Settings",
  [AppMessagesEnum.SETTINGS_LANGUAGE_LABEL]: "Language",
  [AppMessagesEnum.SETTINGS_THEME_LABEL]: "Theme",
  [AppMessagesEnum.SETTINGS_RESET_DATA_BUTTON]: "Reset All Data",
  [AppMessagesEnum.SETTINGS_RESET_DATA_CONFIRMATION]:
    "Are you sure you want to reset all data? This action cannot be undone.",
  [AppMessagesEnum.SETTINGS_DATA_RESET_SUCCESS]:
    "All data has been successfully reset.",
  // #endregion Settings

  // Group Permissions
  [AppMessagesEnum.PERMISSIONS]: "Permissions",
  [AppMessagesEnum.PERMISSION_CHANGE_ACADEMY]: "Change academy",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU]: "Sidebar menu",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_HOME]: "Sidebar menu - Home",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_HOME_TABS]:
    "Sidebar menu - Home (Tabs)",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_HOME_TABS_HOME]:
    "Sidebar menu - Home Tab",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_HOME_TABS_CALENDAR]:
    "Sidebar menu - Calendar Tab",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_HOME_TABS_EXERCISES]:
    "Sidebar menu - Exercises Tab",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_HOME_TABS_EXERCISES_FINALIZE_TRAINING_BUTTON]:
    "Sidebar menu - Exercises Tab - Finish Training Button",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_HOME_TABS_EXERCISES_FINALIZE_EXERCISE_BUTTON]:
    "Sidebar menu - Exercises Tab - Finish Exercise Button",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_HOME_TABS_EXERCISES_USER_GPS_BUTTON]:
    "Sidebar menu - Exercises Tab - User GPS Button",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_HOME_TABS_CARDIO]:
    "Sidebar menu - Cardio Tab",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_HOME_TABS_FINANCIAL]:
    "Sidebar menu - Financial Tab",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_USERS]: "Sidebar menu - Users",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_USERS_VISUALIZE]:
    "Sidebar menu - Users - View",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_USERS_ADD]:
    "Sidebar menu - Users - Add",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_USERS_DELETE]:
    "Sidebar menu - Users - Delete",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_USERS_UPDATE]:
    "Sidebar menu - Users - Update",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_ACADEMIES]:
    "Sidebar menu - Academies",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_ACADEMIES_VISUALIZE]:
    "Sidebar menu - Academies - View",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_ACADEMIES_ADD]:
    "Sidebar menu - Academies - Add",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_ACADEMIES_DELETE]:
    "Sidebar menu - Academies - Delete",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_ACADEMIES_UPDATE]:
    "Sidebar menu - Academies - Update",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_EXERCISES]:
    "Sidebar menu - Exercises",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_EXERCISES_VISUALIZE]:
    "Sidebar menu - Exercises - View",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_EXERCISES_ADD]:
    "Sidebar menu - Exercises - Add",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_EXERCISES_DELETE]:
    "Sidebar menu - Exercises - Delete",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_EXERCISES_UPDATE]:
    "Sidebar menu - Exercises - Update",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_TRAININGS]:
    "Sidebar menu - Trainings",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_TRAININGS_VISUALIZE]:
    "Sidebar menu - Trainings - View",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_TRAININGS_ADD]:
    "Sidebar menu - Trainings - Add",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_TRAININGS_DELETE]:
    "Sidebar menu - Trainings - Delete",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_TRAININGS_UPDATE]:
    "Sidebar menu - Trainings - Update",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_TRAINING_BY_USER_LIST]:
    "Sidebar menu - Trainings by User",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_TRAINING_BY_USER_LIST_VISUALIZE]:
    "Sidebar menu - Trainings by User - View",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_TRAINING_BY_USER_LIST_ADD]:
    "Sidebar menu - Trainings by User - Add",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_TRAINING_BY_USER_LIST_DELETE]:
    "Sidebar menu - Trainings by User - Delete",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_TRAINING_BY_USER_LIST_UPDATE]:
    "Sidebar menu - Trainings by User - Update",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_USER_SETTINGS]:
    "Sidebar menu - User Settings",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_USER_SETTINGS_RESET_DATA_BUTTON]:
    "Sidebar menu - User Settings - Reset Data Button",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_CHARTS]: "Sidebar menu - Charts",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_CHARTS_VISUALIZE]:
    "Sidebar menu - Charts - View",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_CHARTS_DELETE_HISTORY_BUTTON]:
    "Sidebar menu - Charts - Delete History Button",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_CHARTS_DELETE_ALL_HISTORY_BUTTON]:
    "Sidebar menu - Charts - Delete All History Button",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_GROUPS]: "Sidebar menu - Groups",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_GROUPS_CHANGE_ACADEMY_BUTTON]:
    "Sidebar menu - Groups - Change Academy Button",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_GROUPS_ADD]:
    "Sidebar menu - Groups - Add",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_GROUPS_DELETE]:
    "Sidebar menu - Groups - Delete",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_GROUPS_UPDATE]:
    "Sidebar menu - Groups - Update",
  [AppMessagesEnum.PERMISSION_DRAWER_MENU_MY_SUBSCRIPTION]:
    "Sidebar menu - My Subscription",
  // #endregion Permissions
};
