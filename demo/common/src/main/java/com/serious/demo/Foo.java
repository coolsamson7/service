package com.serious.demo;/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.io.Serializable;
import java.util.Date;

/**
 * @author Andreas Ernst
 */
public class Foo implements Serializable {
    String name = "name";
    int age = 10;
    Date date = new Date();
    String data1 = "data1";
    String data2 = "data2";
    String data3 = "data3";
    String data4 = "data4";


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
