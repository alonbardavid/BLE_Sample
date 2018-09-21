package com.ble_react_test;

import android.content.Context;
import android.graphics.BitmapFactory;
import android.graphics.drawable.AnimationDrawable;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.widget.ImageView;

import com.facebook.react.uimanager.ThemedReactContext;

/**
 * Created by alon on 10/08/2018.
 */

public class ManImage extends ImageView {
    private final static int IN_SAMPLE_SIZE = 2;
    private final static int M_SECOND_DELAY = 10;

    private CustomAnimationDrawable frameAnimation;
    public ManImage(ThemedReactContext context) {
        super(context);
        frameAnimation = new CustomAnimationDrawable();
        BitmapFactory.Options bfo = new BitmapFactory.Options();
        Drawable tmp;


        bfo.inSampleSize = IN_SAMPLE_SIZE;

        for (int i=0; i<images_green.length;i++) {
            tmp = new BitmapDrawable(BitmapFactory.decodeResource(getResources(),images_green[i],bfo));
            frameAnimation.addFrame(tmp,  M_SECOND_DELAY);
        }

        this.setBackgroundDrawable(frameAnimation);
        frameAnimation.setOneShot(true);
    }

    public void toIndex(int index){
        frameAnimation.toFrame(index);
    }

    private Integer images_green[] = {R.drawable.green_avi0,R.drawable.green_avi1, R.drawable.green_avi2, R.drawable.green_avi3, R.drawable.green_avi4, R.drawable.green_avi5, R.drawable.green_avi6, R.drawable.green_avi7,
            R.drawable.green_avi8, R.drawable.green_avi9, R.drawable.green_avi10, R.drawable.green_avi11, R.drawable.green_avi12, R.drawable.green_avi13, R.drawable.green_avi14, R.drawable.green_avi15, R.drawable.green_avi16,
            R.drawable.green_avi17, R.drawable.green_avi18, R.drawable.green_avi19, R.drawable.green_avi20, R.drawable.green_avi21, R.drawable.green_avi22, R.drawable.green_avi23, R.drawable.green_avi24, R.drawable.green_avi25,
            R.drawable.green_avi26, R.drawable.green_avi27, R.drawable.green_avi28, R.drawable.green_avi29, R.drawable.green_avi30, R.drawable.green_avi31, R.drawable.green_avi32, R.drawable.green_avi33, R.drawable.green_avi34,
            R.drawable.green_avi35, R.drawable.green_avi36, R.drawable.green_avi37, R.drawable.green_avi38, R.drawable.green_avi39, R.drawable.green_avi40, R.drawable.green_avi41, R.drawable.green_avi42, R.drawable.green_avi43,
            R.drawable.green_avi44, R.drawable.green_avi45, R.drawable.green_avi46, R.drawable.green_avi47, R.drawable.green_avi48, R.drawable.green_avi49, R.drawable.green_avi50};

}
