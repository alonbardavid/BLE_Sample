package com.ble_react_test;

import android.graphics.drawable.AnimationDrawable;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * Created by alon on 10/08/2018.
 */

public class CustomAnimationDrawable extends AnimationDrawable {

    private int requestedFrame = 0;
    private static int FRAME_JUMP = 1;
    private static Method sSetFrame;

    private static Field sCurFrame;
    private static Field sAnimationState;

    static {
        try {

            sSetFrame = AnimationDrawable.class.getDeclaredMethod("setFrame", int.class,
                    boolean.class, boolean.class);
            sSetFrame.setAccessible(true);

            sCurFrame = AnimationDrawable.class.getDeclaredField("mCurFrame");
            sCurFrame.setAccessible(true);
        } catch (Throwable t) {
            throw new RuntimeException(t);
        }
    }
    public void toFrame(int toFrame) {
        this.requestedFrame = toFrame;
        this.start();
    }
    @Override
    public void run() {
        try {
            newNextFrame(false);
        } catch (Exception e){
            //throw new RuntimeException(e);
        }
    }

    public void newNextFrame(boolean unschedule) throws  IllegalAccessException,InvocationTargetException {
        int mCurFrame = (int) sCurFrame.get(this);
        int nextFrame;
        int change = requestedFrame - mCurFrame;
        if ((change < 0 && change > -FRAME_JUMP*3) || (change > 0 && change < FRAME_JUMP*3)) {
            nextFrame = mCurFrame;
        } else {
            nextFrame = requestedFrame > mCurFrame?mCurFrame + FRAME_JUMP:mCurFrame - FRAME_JUMP;
        }

        sSetFrame.invoke(this,nextFrame, unschedule, true);
    }
}
