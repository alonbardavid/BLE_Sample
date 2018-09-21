package com.ble_react_test;

import android.support.v4.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;


import javax.annotation.Nullable;

/**
 * Created by alon on 02/08/2018.
 */

public class URGoBleModule extends ReactContextBaseJavaModule {



    ReactApplicationContext context;

    public URGoBleModule(ReactApplicationContext reactContext){

        super(reactContext);
        this.context = reactContext;
    }

    @Override
    public String getName(){
        return "URGoBle";
    }



}
