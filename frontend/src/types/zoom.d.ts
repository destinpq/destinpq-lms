// Type declarations for the Zoom Meeting SDK
declare global {
  interface Window {
    React: typeof import('react');
    ReactDOM: typeof import('react-dom');
    Redux: typeof import('redux');
    ReduxThunk: typeof import('redux-thunk');
    _: typeof import('lodash');
    ZoomMtg: {
      // Embedded client API
      createClient: () => ZoomEmbeddedClient;
      // Legacy methods
      setZoomJSLib: (path: string, dir: string) => void;
      preLoadWasm: () => void;
      prepareWebSDK: () => void;
      endMeeting: (options: Record<string, unknown>) => void;
      i18n: {
        load: (lang: string) => void;
        reload: (lang: string) => void;
      };
      init: (config: {
        leaveUrl: string;
        success?: () => void;
        error?: (error: Record<string, unknown>) => void;
      }) => void;
      join: (config: {
        signature: string;
        meetingNumber: string;
        userName: string;
        passWord?: string;
        sdkKey: string;
        userEmail?: string;
        success?: () => void;
        error?: (error: Record<string, unknown>) => void;
      }) => void;
      leaveMeeting?: () => void;
    };
  }
  
  // Embedded client interfaces
  interface ZoomEmbeddedClient {
    init: (config: {
      debug?: boolean;
      zoomAppRoot: HTMLElement | null;
      language?: string;
      customize?: {
        video?: {
          isResizable?: boolean;
          viewSizes?: {
            default: {
              width: number;
              height: number;
            }
          }
        }
      }
    }) => void;
    
    join: (config: {
      sdkKey: string;
      signature: string;
      meetingNumber: string;
      password?: string;
      userName: string;
      userEmail?: string;
      success?: () => void;
      error?: (error: any) => void;
    }) => void;
    
    leave: () => void;
  }
}

export {}; 