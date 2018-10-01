/*
Jabra Browser Integration
https://github.com/gnaudio/jabra-browser-integration

MIT License

Copyright (c) 2017 GN Audio A/S (Jabra)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/**
* The global jabra object is your entry for the jabra browser SDK.
*/
namespace jabra {
    /**
     * Version of this javascript api (should match version number in file apart from possible alfa/beta designator).
     */
    export const apiVersion = "2.0.beta2";

    /**
     * Is the current version a beta ?
     */
    const isBeta = apiVersion.includes("beta");

    /**
     * Id of proper (production) release of browser plugin.
     */
    const prodExtensionId = "okpeabepajdgiepelmhkfhkjlhhmofma";

     /**
     * Id of beta release of browser plugin.
     */
    const betaExtensionId = "igcbbdnhomedfadljgcmcfpdcoonihfe";

    /**
     * Contains information about installed components.
     */
    export interface InstallInfo {
        installationOk: boolean;
        version_chromehost: string;
        version_nativesdk: string;
        version_browserextension: string;
        version_jsapi: string;
        browserextension_id: string;
        browserextension_type: string;
    };

    // TODO: Merge device and DeviceInfo.
    /**
     * Contains information about a device
     */
    export interface DeviceInfo {
        deviceID: number;
        deviceName: string;
        deviceConnection: number;
        errStatus: number;
        isBTPaired?: boolean;
        isInFirmwareUpdateMode: boolean;
        productID: number;
        serialNumber?: string,
        variant: string;
        dongleName?: string;
        skypeCertified: boolean;
        firmwareVersion?: string;
        electricSerialNumbers?: ReadonlyArray<string>;
        batteryLevelInPercent?: number;
        batteryCharging?: boolean;
        batteryLow?: boolean;
        leftEarBudStatus?: boolean;
        equalizerEnabled?: boolean;
        busyLight?: boolean;

        /**
         * Set to ID of related dongle and/or headset if both are paired and connected.
         */
        connectedDeviceID?: number;

        /**
         * Set if the same device is connected in more than one way (BT and USB), so
         * the device appears twice.
         */
        aliasDeviceID?: number;

        /**
         * Only available in debug versions.
         */
        parentInstanceId?: string;

        /**
         * Only available in debug versions.
         */
        usbDevicePath?: string;

        /**
         * Browser media device information group (browser session specific).
         * Only available when calling getDevices/getActiveDevice with includeBrowserMediaDeviceInfo argument set to true.
         */
        browserGroupId?: string;

        /**
         * The browser's unique identifier for the input (e.g. microphone) part of the Jabra device (page orgin specific).
         * Only available when calling getDevices/getActiveDevice with includeBrowserMediaDeviceInfo argument set to true.
         */
        browserAudioInputId?: string;

         /**
         * The browser's unique identifier for an output (e.g. speaker) part of the Jabra device (page orgin specific).
         * Only available when calling getDevices/getActiveDevice with includeBrowserMediaDeviceInfo argument set to true.
         */
        browserAudioOutputId?: string;

         /**
         * The browser's textual descriptor of the device.
         * Only available when calling getDevices/getActiveDevice with includeBrowserMediaDeviceInfo argument set to true.
         */
        browserLabel?: string;
    };

    /**
     * A combination of a media stream and information of the assoicated device from the view of the browser.
     */
    export interface MediaStreamAndDeviceInfoPair {
        stream: MediaStream;
        deviceInfo: DeviceInfo
    };

    /**
     * Names of command response events.
     */
    const commandEventsList = [
        "devices",
        "activedevice",
        "getinstallinfo",
        "Version"
    ];

    /**
     * All possible device events as discriminative  union.
     */
    export type EventName = "mute" | "unmute" | "device attached" | "device detached" | "acceptcall"
                            | "endcall" | "reject" | "flash" | "online" | "offline" | "linebusy" | "lineidle"
                            | "redial" | "key0" | "key1" | "key2" | "key3" | "key4" | "key5"
                            | "key6" | "key7" | "key8" | "key9" | "keyStar" | "keyPound"
                            | "keyClear" | "Online" | "speedDial" | "voiceMail" | "LineBusy"
                            | "outOfRange" | "intoRange" | "pseudoAcceptcall" | "pseudoEndcall" 
                            | "button1" | "button2" | "button3" | "volumeUp" | "volumeDown" | "fireAlarm"
                            | "jackConnection" | "jackDisConnection" | "qdConnection" | "qdDisconnection"
                            | "headsetConnection" | "headsetDisConnection" | "devlog" | "busylight" 
                            | "hearThrough" | "batteryStatus" | "error";

    /**
     * All possible device events as internal array.
     */
    let eventNamesList: ReadonlyArray<EventName>
                       = [  "mute", "unmute", "device attached", "device detached", "acceptcall",
                            "endcall", "reject", "flash", "online", "offline", "linebusy", "lineidle",
                            "redial", "key0", "key1", "key2", "key3", "key4", "key5",
                            "key6", "key7", "key8", "key9", "keyStar", "keyPound",
                            "keyClear", "Online", "speedDial", "voiceMail", "LineBusy",
                            "outOfRange", "intoRange", "pseudoAcceptcall", "pseudoEndcall",
                            "button1", "button2", "button3", "volumeUp", "volumeDown", "fireAlarm",
                            "jackConnection", "jackDisConnection", "qdConnection", "qdDisconnection", 
                            "headsetConnection","headsetDisConnection", "devlog", "busylight", 
                            "hearThrough", "batteryStatus", "error" ];


    /**
     * Internal helper that stores information about the promise to resolve/reject
     * for a command being processed.
     */
    interface PromiseCallbacks {
        resolve: (value?: any | PromiseLike<any> | undefined) => void;
        reject: (err: Error) => void;
    }

    /**
     * Event type for call backs.
     */
    export interface Event {
        name: string;
        data: {
            deviceID: number;
            /* variable */
        };
    };

    /**
     * The format of errors returned.
     */
    export type ClientError = any | {
        error: string;
    };

     /**
     * The format of messages returned.
     */
    export type ClientMessage = any | {
        message: string;
    };    
    
    /**
     * Type for event callback functions..
     */
    export declare type EventCallback = (event: Event) => void;

    /**
     * Internal mapping from all known events to array of registered callbacks. All possible events are setup
     * initially. Callbacks values are configured at runtime.
     */
    const eventListeners: Map<EventName, Array<EventCallback>> = new Map<EventName, Array<EventCallback>>();
    eventNamesList.forEach((event: EventName) => eventListeners.set(event, []));

    /**
     * The log level curently used internally in this api facade. Initially this is set to show errors and 
     * warnings until a logEvent (>=0.5) changes this when initializing the extension or when the user
     * changes the log level. Available in the API for testing only - do not use this in normal applications.
     */
    export let logLevel: number = 2;

    /**
     * An internal logger helper.
     */
    const logger = new class {
        trace(msg: string) {
            if (logLevel >= 4) {
                console.log(msg);
            }
        };

        info(msg: string) {
            if (logLevel >= 3) {
                console.log(msg);
            }
        };

        warn(msg: string) {
            if (logLevel >= 2) {
                console.warn(msg);
            }
        };

        error(msg: string) {
            if (logLevel >= 1) {
                console.error(msg);
            }
        };
    };

    /**
     * A reasonably unique ID for our browser extension client that makes it possible to
     * differentiate between different instances of this api in different browser tabs.
     */
    const apiClientId: string = Math.random().toString(36).substr(2, 9);

    /**
     * A mapping from unique request ids for commands and the promise information needed 
     * to resolve/reject them by an incomming event.
     */
    const sendRequestResultMap: Map<string, PromiseCallbacks> = new Map<string, PromiseCallbacks>();

    /**
    * A counter used to generate unique request ID's used to match commands and returning events.
    */
    let requestNumber: number = 1;

    /**
     * Contains initialization information used by the init/shutdown methods.
     */
    let initState: {
        initialized?: boolean;
        initializing?: boolean;
        eventCallback?: (event: any) => void;
    } = {};

    /**
     * The JavaScript library must be initialized using this function. It returns a promise that
     * resolves when initialization is complete.
    */
    export function init(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Only Chrome is currently supported
            let isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
            if (!isChrome) {
                return reject(new Error("Jabra Browser Integration: Only supported by <a href='https://google.com/chrome'>Google Chrome</a>."));
            }

            if (initState.initialized || initState.initializing) {
                return reject(new Error("Jabra Browser Integration already initialized"));
            }

            initState.initializing = true;
            sendRequestResultMap.clear();
            let duringInit = true;

            initState.eventCallback = (event: any) => {
                if (event.source === window &&
                    event.data.direction &&
                    event.data.direction === "jabra-headset-extension-from-content-script") {

                    let apiClientId = event.data.apiClientId || "";
                    let requestId = event.data.requestId || "";

                    // Only accept responses from our own requests or from device.
                    if (apiClientId === apiClientId || apiClientId === "") {
                        logger.trace("Receiving event from content script: " + JSON.stringify(event.data));

                        // For backwards compatibility a blank message might be send as "na".
                        if (event.data.message === "na") {
                            delete event.data.message;
                        }

                        if (event.data.message && event.data.message.startsWith("Event: logLevel")) {
                            logLevel = parseInt(event.data.message.substring(16));
                            logger.trace("Logger set to level " + logLevel);
                        } else if (duringInit === true) {
                            // Hmm... this assume first event will be passed on to native host,
                            // so it won't work with logLevel. Thus we check log level first.
                            duringInit = false;
                            if (event.data.error != null && event.data.error != undefined) {
                                return reject(new Error(event.data.error));
                            } else {
                                return resolve();
                            }
                        } else if (event.data.message) {
                            logger.trace("Got message: " + JSON.stringify(event.data));
                            const normalizedMsg: string = event.data.message.substring(7); // Strip "Event" prefix;
                            const commandIndex = commandEventsList.findIndex((e) => normalizedMsg.startsWith(e));
                            if (commandIndex >= 0) {
                                // For install info and version command, we need to add api version number.
                                if (normalizedMsg === "getinstallinfo" || (normalizedMsg.startsWith("Version "))) {
                                    // Old extension/host won't have data so make sure it exists to avoid breakage.
                                    if (!event.data.data) {
                                        event.data.data = {};
                                    }
                                    event.data.data.version_jsapi = apiVersion;
                                }

                                // For install info also check if the full installation is consistant.
                                if (normalizedMsg === "getinstallinfo") {
                                    event.data.data.installationOk = isInstallationOk(event.data.data);
                                }
                             
                                // Lookup and check that we have identified a (real) command target to pair result with.
                                let resultTarget = identifyAndCleanupResultTarget(requestId);
                                if (!resultTarget) {
                                    let err = "Result target information missing for message " + event.data.message + ". This is likely due to some software components that have not been updated. Please upgrade extension and/or chromehost";
                                    logger.error(err);
                                    notify("error", {
                                        error: err,
                                        message: event.data.message
                                    });
                                    return;
                                }
                                
                                let result: any;
                                if (event.data.data) {
                                    result = event.data.data;
                                } else {
                                    let dataPosition = commandEventsList[commandIndex].length + 1;
                                    let dataStr = normalizedMsg.substring(dataPosition);
                                    result = {};
                                    if (dataStr) {
                                      result.legacy_result =  dataStr;
                                    };
                                }

                                resultTarget.resolve(result);                                
                            } else if (eventListeners.has(normalizedMsg as EventName)) {
                                let clientEvent: ClientMessage = JSON.parse(JSON.stringify(event.data));
                                delete clientEvent.direction;
                                delete clientEvent.apiClientId;
                                delete clientEvent.requestId;
                                clientEvent.message = normalizedMsg;

                                notify(normalizedMsg as EventName, clientEvent);
                            } else {
                                logger.warn("Unknown message: " + event.data.message);
                                notify("error", {
                                    error: "Unknown message: ",
                                    message: event.data.message
                                });
                            }
                        } else if (event.data.error) {
                            logger.error("Got error: " + event.data.error);
                            const normalizedError: string = event.data.error.substring(7); // Strip "Error" prefix;

                            // Reject target promise if there is one - otherwise send a general error.
                            let resultTarget = identifyAndCleanupResultTarget(requestId);
                            if (resultTarget) {
                                resultTarget.reject(new Error(normalizedError));
                            } else {
                                let clientError: ClientError = JSON.parse(JSON.stringify(event.data));
                                delete clientError.direction;
                                delete clientError.apiClientId;
                                delete clientError.requestId;
                                clientError.error = normalizedError;

                                notify("error", clientError);
                            }
                        }
                    }
                }
            };

            window.addEventListener("message", initState.eventCallback!);

            sendCmd("logLevel", null, false);

            // Initial getversion and loglevel.
            setTimeout(
                () => {
                    sendCmdWithResult("getversion", null, false).then((result) => {
                        let resultStr = (typeof result === 'string' || result instanceof String) ? result : JSON.stringify(result, null, 2);
                        logger.trace("getversion returned successfully with : " + resultStr);
                    }).catch((error) => {
                        logger.error(error);
                    });
                },
                1000
            );

            // Check if the web-extension is installed
            setTimeout(
                function () {
                    if (duringInit === true) {
                        duringInit = false;
                        const extensionId = isBeta ? betaExtensionId : prodExtensionId;
                        reject(new Error("Jabra Browser Integration: You need to use this <a href='https://chrome.google.com/webstore/detail/" + extensionId + "'>Extension</a> and then reload this page"));
                    }
                },
                5000
            );

            /**
             * Helper that checks if the installation is consistant.
             */
            function isInstallationOk(installInfo: InstallInfo): boolean {
                let browserSdkVersions = [installInfo.version_browserextension, installInfo.version_chromehost, installInfo.version_jsapi];
  
                // Check that we have install information for all components.
                if (browserSdkVersions.some(v => !v) || !installInfo.version_nativesdk) {
                    return false;
                }

                // Check that different beta versions are not mixed.
                if (!browserSdkVersions.map(v => {
                    let betaIndex = v.lastIndexOf('beta');
                    if (betaIndex && v.length>betaIndex+4) {
                        return v.substr(betaIndex+4);
                    } else {
                        return undefined;
                    }
                }).filter(v => v).every((v, i, arr) => v === arr[0])) {
                    return false;
                }

                return true;
            }

            /**
             * Post event/error to subscribers.
             */
            function notify(eventName: EventName, eventMsg: ClientMessage | ClientError): void {
                let callbacks = eventListeners.get(eventName);
                if (callbacks) {
                    callbacks.forEach((callback) => {
                        callback(eventMsg);
                    });
                } else {
                    // This should not occur unless internal event mappings in this file
                    // are not configured correctly.
                    logger.error("Unexpected unknown eventName: " + eventName);
                }
            }

            /** Lookup any previous stored result target informaton for the request.
            *   Does cleanup if target found (so can not be called twice for a request).
            *   Nb. requestId's are only provided by >= 0.5 extension and chromehost. 
            */
            function identifyAndCleanupResultTarget(requestId?: string) : PromiseCallbacks | undefined {
                // Lookup any previous stored result target informaton for the request.
                // Nb. requestId's are only provided by >= 0.5 extension and chromehost. 
                let resultTarget: PromiseCallbacks | undefined;
                if (requestId) {
                    resultTarget = sendRequestResultMap.get(requestId);
                    // Remember to cleanup to avoid memory leak!
                    sendRequestResultMap.delete(requestId);
                } else if (sendRequestResultMap.size === 1) {
                    // We don't have a requestId but since only one is being executed we
                    // can assume this is the one.
                    let value = sendRequestResultMap.entries().next().value;
                    resultTarget = value[1];
                    // Remember to cleanup to avoid memory leak!
                    sendRequestResultMap.delete(value[0]);
                } else {
                    // No idea what target matches what request - give up.
                    resultTarget = undefined;
                }

                return resultTarget;

            }

            initState.initialized = true;
            initState.initializing = false;
        });
    };

    /**
    * De-initialize the api after use. Not normally used as api will normally
    * stay in use thoughout an application - mostly of interest for testing.
    */
    export function shutdown() {
        if (initState.initialized) {
            window.removeEventListener("message", initState.eventCallback!);
            initState.eventCallback = undefined;
            sendRequestResultMap.clear();
            requestNumber = 1;
            initState.initialized = false;

            // Unsubscribe all.
            eventListeners.forEach((value, key) => {
                value = [];
            });
            return true;
        }

        return false;
    };

    /**
     * Internal helper that returns an array of valid event keys that correspond to the event specificator 
     * and are know to exist in our event listener map.
     */
    function getEvents(nameSpec: string | RegExp | Array<string | RegExp>): ReadonlyArray<string> {
        if (Array.isArray(nameSpec)) {
            return [ ...new Set<string>([].concat.apply([], nameSpec.map(a => getEvents(a)))) ];
        } else if (nameSpec instanceof RegExp) {
            return Array.from<string>(eventListeners.keys()).filter(key => nameSpec.test(key))
        } else { // String
            if (eventListeners.has(nameSpec as EventName)) {
             return [ nameSpec ];
            } else {
                logger.warn("Unknown event " + nameSpec + " ignored when adding/removing eventlistener");
            }
        }

        return [];
    }

    /**
     * Hook up listener call back to specified event(s) as specified by initial name specification argument nameSpec.
     * When the nameSpec argument is a string, this correspond to a single named event. When the argument is a regular
     * expression all lister subscribes to all matching events. If the argument is an array it recursively subscribes
     * to all events specified in the array.
     */
    export function addEventListener(nameSpec: string | RegExp | Array<string | RegExp>, callback: EventCallback): void {
        getEvents(nameSpec).map(name => {
            let callbacks = eventListeners.get(name as EventName);
            if (!callbacks!.find((c) => c === callback)) {
              callbacks!.push(callback);
            }
        });
    };

    /**
     * Remove existing listener to specified event(s). The callback must correspond to the exact callback provided
     * to a previous addEventListener. 
     */
    export function removeEventListener(nameSpec: string | RegExp | Array<string | RegExp>, callback: EventCallback): void {
        getEvents(nameSpec).map(name => {
            let callbacks = eventListeners.get(name as EventName);
            let findIndex = callbacks!.findIndex((c) => c === callback);
            if (findIndex >= 0) {
              callbacks!.splice(findIndex, 1);
            }
        });
    };

    /**
    * Activate ringer (if supported) on the Jabra Device
    */
    export function ring(): void {
        sendCmd("ring");
    };

    /**
    * Change state to in-a-call.
    */
    export function offHook(): void {
        sendCmd("offhook");
    };

    /**
    * Change state to idle (not-in-a-call).
    */
    export function onHook(): void {
        sendCmd("onhook");
    };

    /**
    * Mutes the microphone (if supported).
    */
    export function mute(): void {
        sendCmd("mute");
    };

    /**
    * Unmutes the microphone (if supported).
    */
    export function unmute(): void {
        sendCmd("unmute");
    };

    /**
    * Change state to held (if supported).
    */
    export function hold(): void {
        sendCmd("hold");
    };

    /**
    * Change state from held to OffHook (if supported).
    */
    export function resume(): void {
        sendCmd("resume");
    };

    /**
    * Internal helper to get detailed information about the current active Jabra Device
    * from SDK, including current status but excluding media device information.
    */
    function _doGetActiveSDKDevice(): Promise<DeviceInfo> {
      return sendCmdWithResult<DeviceInfo>("getactivedevice");
    };

    /**
    * Internal helper to get detailed information about the all attached Jabra Devices
    * from SDK, including current status but excluding media device information.
    */
    function _doGetSDKDevices(): Promise<ReadonlyArray<DeviceInfo>> {
        return sendCmdWithResult<ReadonlyArray<DeviceInfo>>("getdevices");
    };

    /**
    * Get detailed information about the current active Jabra Device, including current status
    * and optionally also including related browser media device information. 
    * 
    * Note that browser media device information requires mediaDevices.getUserMedia or
    * getUserDeviceMediaExt to have been called so permissions are granted. Browser media information
    * is useful for setting a device constraint on mediaDevices.getUserMedia for input or for calling 
    * setSinkId (when supported by the browser) to set output.
    */
    export function getActiveDevice(includeBrowserMediaDeviceInfo: boolean | string = false): Promise<DeviceInfo> {
        let includeBrowserMediaDeviceInfoVal: boolean;

        if ((typeof includeBrowserMediaDeviceInfo === 'string') || ((includeBrowserMediaDeviceInfo as any) instanceof String))  {
            includeBrowserMediaDeviceInfoVal = (includeBrowserMediaDeviceInfo === 'true' || includeBrowserMediaDeviceInfo === '1');
        } else if (typeof(includeBrowserMediaDeviceInfo) === "boolean")  {
            includeBrowserMediaDeviceInfoVal = includeBrowserMediaDeviceInfo;
        } else {
            throw new Error("Illegal argument - boolean or string expected");
        }

        if (includeBrowserMediaDeviceInfoVal) {
            return _doGetActiveSDKDevice_And_BrowserDevice();
        } else {
            return _doGetActiveSDKDevice();
        }
    };

    /**
    * List detailed information about all attached Jabra Devices, including current status.
    * and optionally also including related browser media device information.
    * 
    * Note that browser media device information requires mediaDevices.getUserMedia or
    * getUserDeviceMediaExt to have been called so permissions are granted. Browser media information
    * is useful for setting a device constraint on mediaDevices.getUserMedia for input or for calling 
    * setSinkId (when supported by the browser) to set output.
    */
    export function getDevices(includeBrowserMediaDeviceInfo: boolean | string = false): Promise<ReadonlyArray<DeviceInfo>> {
        let includeBrowserMediaDeviceInfoVal: boolean;

        if ((typeof includeBrowserMediaDeviceInfo === 'string') || ((includeBrowserMediaDeviceInfo as any) instanceof String))  {
            includeBrowserMediaDeviceInfoVal = (includeBrowserMediaDeviceInfo === 'true' || includeBrowserMediaDeviceInfo === '1');
        } else if (typeof(includeBrowserMediaDeviceInfo) === "boolean")  {
            includeBrowserMediaDeviceInfoVal = includeBrowserMediaDeviceInfo;
        } else {
            throw new Error("Illegal argument - boolean or string expected");
        }

        if (includeBrowserMediaDeviceInfoVal) {
            return _doGetSDKDevices_And_BrowserDevice();
        } else {
            return _doGetSDKDevices();
        }

        return sendCmdWithResult<ReadonlyArray<DeviceInfo>>("getdevices");
     };

    /**
    * Select a new active device.
    */
    export function setActiveDeviceId(id: number | string): void {
        let idVal;

        if ((typeof id === 'string') || ((id as any) instanceof String))  {
            idVal = parseInt(id as string);
        } else if (typeof id == 'number') {
            idVal = id;
        } else {
            throw new Error("Illegal argument - number or string expected");
        }
        
        // Use both new and old way of passing parameters for compatibility with <= v0.5.
        sendCmd("setactivedevice " + id.toString(), { id: idVal } );
    };

    /**
    * Set busylight on active device (if supported)
    */
    export function setBusyLight(busy: boolean | string): void {
        let busyVal;

        if ((typeof busy === 'string') || ((busy as any) instanceof String))  {
            busyVal = (busy == 'true' || busy == '1');
        } else if (typeof(busy) === "boolean") {
            busyVal = busy;
        } else {
            throw new Error("Illegal argument - boolean or string expected");
        }
        
        sendCmd("setbusylight", { busy: busyVal } );
    };

    /**
    * Get version number information for all components.
    */
    export function getInstallInfo(): Promise<InstallInfo> {
        return sendCmdWithResult<InstallInfo>("getinstallinfo");
    };

    /**
    * Internal helper that forwards a command to the browser extension
    * without expecting a response.
    */
    function sendCmd(cmd: string, args: object | null = null, requireInitializedCheck: boolean = true): void {
        if (!requireInitializedCheck || (requireInitializedCheck && initState.initialized)) {
            let requestId = (requestNumber++).toString();

            let msg = {
                direction: "jabra-headset-extension-from-page-script",
                message: cmd,
                args: args || {},
                requestId: requestId,
                apiClientId: apiClientId,
                version_jsapi: apiVersion
            };

            logger.trace("Sending command to content script: " + JSON.stringify(msg));

            window.postMessage(msg, "*");
        } else {
            throw new Error("Browser integration not initialized");
        }
    };

    /**
    * Internal helper that forwards a command to the browser extension
    * expecting a response (a promise).
    */
    function sendCmdWithResult<T>(cmd: string, args: object | null = null, requireInitializedCheck: boolean = true): Promise<T> {
        if (!requireInitializedCheck || (requireInitializedCheck && initState.initialized)) {
            let requestId = (requestNumber++).toString();

            return new Promise<T>((resolve, reject) => {
                sendRequestResultMap.set(requestId, { resolve, reject });

                let msg = {
                    direction: "jabra-headset-extension-from-page-script",
                    message: cmd,
                    args: args || {},
                    requestId: requestId,
                    apiClientId: apiClientId,
                    version_jsapi: apiVersion
                };

                logger.trace("Sending command to content script expecting result: " + JSON.stringify(msg));

                window.postMessage(msg, "*");
            });
        } else {
            return Promise.reject(new Error("Browser integration not initialized"));
        }
    };

    /**
    * Configure a <audio> html element on a webpage to use jabra audio device as speaker output. Returns a promise with boolean success status.
    * The deviceInfo argument must come from getDeviceInfo or getUserDeviceMediaExt calls.
    */
    export function trySetDeviceOutput(audioElement: HTMLMediaElement, deviceInfo: DeviceInfo): Promise<boolean> {
        if (!audioElement || !deviceInfo) {
            return Promise.reject(new Error('Call to trySetDeviceOutput has argument(s) missing'));
        }

        if (!(typeof ((audioElement as any).setSinkId) === "function")) {
            return Promise.reject(new Error('Your browser does not support required Audio Output Devices API'));
        }

        return (audioElement as any).setSinkId(deviceInfo.browserAudioOutputId).then(() => {
            var success = (audioElement as any).sinkId === deviceInfo.browserAudioOutputId;
            return success;
        });
    };

    /**
     * Checks if a Jabra Input device is in fact selected in a media stream.
     * The deviceInfo argument must come from getDeviceInfo or getUserDeviceMediaExt calls.
     */
    export function isDeviceSelectedForInput(mediaStream: MediaStream, deviceInfo: DeviceInfo): boolean {
        if (!mediaStream || !deviceInfo) {
            throw Error('Call to isDeviceSelectedForInput has argument(s) missing');
        }

        var tracks = mediaStream.getAudioTracks();
        for (var i = 0, len = tracks.length; i < len; i++) {
            var track = tracks[i];
            var trackCap = track.getCapabilities();
            if (trackCap.deviceId !== deviceInfo.browserAudioInputId) {
                return false;
            }
        }

        return true;
    };

    /**
    * Replacement for mediaDevices.getUserMedia that makes a best effort to select the active Jabra audio device 
    * to be used for the microphone. Unlike getUserMedia this method returns a promise that
    * resolve to a object containing both a stream and the device info for the selected device.
    * 
    * Optional, additional non-audio constrains (like f.x. video) can be specified as well.
    * 
    * Note: Subsequetly, if this method appears to succed use the isDeviceSelectedForInput function to check 
    * if the browser did in fact choose a Jabra device for the microphone.
    */
    export function getUserDeviceMediaExt(constraints?: MediaStreamConstraints): Promise<MediaStreamAndDeviceInfoPair> {
        // Good error if using old browser:
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return Promise.reject(new Error('Your browser does not support required media api'));
        }

        // Init completed ?
        if (!initState.initialized) {
            return Promise.reject(new Error("Browser integration not initialized"));
        }

        // Warn of degraded UX experience unless we are running https.
        if (location.protocol !== 'https:') {
            logger.warn("This function needs to run under https for best UX experience (persisted permissions)");
        }

        /**
         * Utility method that combines constraints with ours taking precendence (deep). 
         */
        function mergeConstraints(ours: MediaStreamConstraints, theirs?: MediaStreamConstraints): MediaStreamConstraints {
            if (theirs !== null && theirs !== undefined && typeof ours === 'object') {
                let result: { [index: string]: any } = {};
                for (var attrname in theirs) { result[attrname] = (theirs as any)[attrname]; }
                for (var attrname in ours) { result[attrname] = mergeConstraints((ours as any)[attrname], (theirs as any)[attrname]); } // Ours takes precedence.
                return result;
            } else {
                return ours;
            }
        }

        // If we have the input device id already we can do a direct call to getUserMedia, otherwise we have to do
        // an initial general call to getUserMedia just get access to looking up the input device and than a second
        // call to getUserMedia to make sure the Jabra input device is selected.
        return navigator.mediaDevices.getUserMedia(mergeConstraints({ audio: true }, constraints)).then((dummyStream) => {
            return _doGetActiveSDKDevice_And_BrowserDevice().then((deviceInfo) => {
                // Shutdown initial dummy stream (not sure it is really required but lets be nice).
                dummyStream.getTracks().forEach((track) => {
                    track.stop();
                });

                if (deviceInfo && deviceInfo.browserAudioInputId) {                   
                    return navigator.mediaDevices.getUserMedia(mergeConstraints({ audio: { deviceId: deviceInfo.browserAudioInputId } }, constraints))
                        .then((stream) => {
                            return {
                                stream: stream,
                                deviceInfo: deviceInfo
                            };
                        })
                } else {
                    return Promise.reject(new Error('Could not find a Jabra device with a microphone'));
                }
            })
        });
    };

    /**
     * Internal helper for add media information properties to existing SDK device information.
     */
    function fillInMatchingMediaInfo(deviceInfo: DeviceInfo, mediaDevices: MediaDeviceInfo[]): void {
        function findBestMatchIndex(sdkDeviceName: string, mediaDeviceNameCandidates: string[]): number {
            // Edit distance helper adapted from
            // https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
            function editDistance(s1: string, s2: string) {
                s1 = s1.toLowerCase();
                s2 = s2.toLowerCase();
                
                var costs = new Array();
                for (var i = 0; i <= s1.length; i++) {
                    var lastValue = i;
                    for (var j = 0; j <= s2.length; j++) {
                    if (i == 0)
                        costs[j] = j;
                    else {
                        if (j > 0) {
                        var newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                        }
                    }
                    }
                    if (i > 0)
                    costs[s2.length] = lastValue;
                }
                return costs[s2.length];
            }
            
            // Levenshtein distance helper adapted from
            // https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
            function levenshteinDistance(s1: string, s2: string) : number {
                let longer = s1;
                let shorter = s2;
                if (s1.length < s2.length) {
                    longer = s2;
                    shorter = s1;
                }
                let longerLength = longer.length;
                if (longerLength === 0) {
                    return 1.0;
                }
                return (longerLength - editDistance(longer, shorter)) / longerLength;
            }

            if (mediaDeviceNameCandidates.length == 1) {
                return 0;
            } else if (mediaDeviceNameCandidates.length > 0) {
                let similarities = mediaDeviceNameCandidates.map(candidate => {
                    if (candidate.includes("(" + sdkDeviceName + ")")) {
                        return 1.0;
                    } else {
                        // Remove Standard/Default prefix from label in Chrome when comparing
                        let prefixEnd = candidate.indexOf(' - ');
                        let cleanedCandidate = (prefixEnd >= 0) ? candidate.substring(prefixEnd + 3) : candidate;

                        return levenshteinDistance(sdkDeviceName, cleanedCandidate)
                    }
                });
                let bestMatchIndex = similarities.reduce((prevIndexMax, value, i, a) => value > a[prevIndexMax] ? i : prevIndexMax, 0);
                return bestMatchIndex;
            } else {
                return -1;
            }
        }
            
        // Find matchin pair input or output device.
        function findMatchingMediaDevice(groupId: string, kind: string, src: MediaDeviceInfo[]): MediaDeviceInfo | undefined {
            return src.find(md => md.groupId == groupId && md.kind == kind);
        }
        
        if (deviceInfo && deviceInfo.deviceName) {
            let groupId: string | undefined = undefined;
            let audioInputId: string | undefined = undefined;
            let audioOutputId: string | undefined = undefined;
            let label: string | undefined = undefined;
            // Filter out non Jabra input/output devices:
            let jabraMediaDevices = mediaDevices.filter(device => device.label
                && device.label.toLowerCase().includes('jabra')
                && (device.kind === 'audioinput' || device.kind === 'audiooutput'));
            let someJabraDeviceIndex = findBestMatchIndex(deviceInfo.deviceName, jabraMediaDevices.map(md => md.label));
            if (someJabraDeviceIndex >= 0) {
                let foundDevice = jabraMediaDevices[someJabraDeviceIndex];
                groupId = foundDevice.groupId;
                label = foundDevice.label;
                if (foundDevice.kind === 'audioinput') {
                    audioInputId = foundDevice.deviceId;
                    // Lookup matching output device:
                    let outputDevice = findMatchingMediaDevice(groupId, 'audiooutput', jabraMediaDevices);
                    if (outputDevice) {
                        audioOutputId = outputDevice.deviceId;
                    }
                }
                else if (foundDevice.kind === 'audiooutput') {
                    audioOutputId = foundDevice.deviceId;
                    // Lookup matching output input device:
                    let inputDevice = findMatchingMediaDevice(groupId, 'audioinput', jabraMediaDevices);
                    if (inputDevice) {
                        audioInputId = inputDevice.deviceId;
                    }
                }
            }
            if (groupId) {
                deviceInfo.browserGroupId = groupId;
            }
            if (label) {
                deviceInfo.browserLabel = label;
            }
            if (audioInputId) {
                deviceInfo.browserAudioInputId = audioInputId;
            }
            if (audioOutputId) {
                deviceInfo.browserAudioOutputId = audioOutputId;
            }
        }
    }

    /** 
     * Internal helper that returns complete device information, including both SDK and browser media device 
     * information for all devices. 
     * 
     * Chrome note:
     * 1) Only works if hosted under https.
     * 
     * Firefox note:
     * 1) Output devices not supported yet. See "https://bugzilla.mozilla.org/show_bug.cgi?id=934425"
     * 2) The user must have provided permission to use the specific device to use it as a constraint.
     * 3) GroupId not supported.
     * 
     * General non-chrome browser note:  
     * 1) Returning output devices requires support for new Audio Output Devices API.
     */
    function _doGetSDKDevices_And_BrowserDevice(): Promise<ReadonlyArray<DeviceInfo>> {
         // Good error if using old browser:
         if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return Promise.reject(new Error('Your browser does not support required media api'));
        }

        // Init completed ?
        if (!initState.initialized) {
            return Promise.reject(new Error("Browser integration not initialized"));
        }

        // Browser security rules (for at least chrome) requires site to run under https for labels to be read.
        if (location.protocol !== 'https:') {
            return Promise.reject(new Error('Your browser needs https for lookup to work'));
        }

        return Promise.all([_doGetSDKDevices(), navigator.mediaDevices.enumerateDevices()]).then( ([deviceInfos, mediaDevices]) => {
            deviceInfos.forEach( (deviceInfo) => {
                fillInMatchingMediaInfo(deviceInfo, mediaDevices);
            });

            return deviceInfos;
        });
    }

    /** 
     * Internal helper that returns complete device information, including both SDK and browser media device 
     * information for active device. 
     * 
     * Chrome note:
     * 1) Only works if hosted under https.
     * 
     * Firefox note:
     * 1) Output devices not supported yet. See "https://bugzilla.mozilla.org/show_bug.cgi?id=934425"
     * 2) The user must have provided permission to use the specific device to use it as a constraint.
     * 3) GroupId not supported.
     * 
     * General non-chrome browser note:  
     * 1) Returning output devices requires support for new Audio Output Devices API.
     */
    function _doGetActiveSDKDevice_And_BrowserDevice(): Promise<DeviceInfo> {
         // Good error if using old browser:
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return Promise.reject(new Error('Your browser does not support required media api'));
        }

        // Init completed ?
        if (!initState.initialized) {
            return Promise.reject(new Error("Browser integration not initialized"));
        }

        // Browser security rules (for at least chrome) requires site to run under https for labels to be read.
        if (location.protocol !== 'https:') {
            return Promise.reject(new Error('Your browser needs https for lookup to work'));
        }

        // enumerateDevices requires user to have provided permission using getUserMedia for labels to be filled out.
        return Promise.all([_doGetActiveSDKDevice(), navigator.mediaDevices.enumerateDevices()]).then( ([deviceInfo, mediaDevices]) => {
            fillInMatchingMediaInfo(deviceInfo, mediaDevices);
            return deviceInfo;
        });
    };   
};
