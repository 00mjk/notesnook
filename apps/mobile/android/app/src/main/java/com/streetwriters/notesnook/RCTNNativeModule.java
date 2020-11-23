package com.streetwriters.notesnook;


import android.view.WindowManager;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
;


public class RCTNNativeModule extends ReactContextBaseJavaModule {

    ReactContext mContext;

    public RCTNNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
    }

    @Override
    public String getName() {
        return "NNativeModule";
    }


    @ReactMethod
    public void setSecureMode(final boolean mode) {
        try {

            getCurrentActivity().runOnUiThread(() -> {

                try {
                    if (mode)
                        getCurrentActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
                    else
                        getCurrentActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
                } catch (Exception e) {
                }

            });
        } catch (Exception e) {

        }
    }


}
