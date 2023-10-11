package com.serious.service.channel.dispatch;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */


import com.serious.service.ChannelManager;
import com.serious.service.RegisterChannel;
import com.serious.service.ServiceAddress;
import com.serious.service.channel.SimpleMethodInvocation;
import com.serious.service.channel.rest.RestChannel;
import com.serious.util.Exceptions;
import org.aopalliance.intercept.MethodInvocation;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.*;
import java.util.Base64;
import java.util.List;

@RegisterChannel("dispatch")
public class DispatchChannel extends RestChannel {
    // static methods

    public static String encodeAsString( byte[] data) {
        return Base64.getEncoder().encodeToString(data);
    }

    public static byte[] decodeFromString(String data) {
        return Base64.getDecoder().decode(data);
    }

    public static byte[] encodeObject(Object o) {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ObjectOutputStream out = null;
        try {
            out = new ObjectOutputStream(bos);

            out.writeObject(o);
            out.flush();

            return bos.toByteArray();
        }
        catch (IOException e) {
            Exceptions.throwException(e);

            return null;
        }
        finally {
            try {
                bos.close();
            }
            catch (IOException ex) {
                // ignore close exception
            }
        }
    }

    public  static Object decodeObject(byte[] bytes) {
        ByteArrayInputStream bis = new ByteArrayInputStream(bytes);
        ObjectInput in = null;
        try {
            in = new ObjectInputStream(bis);
            return  in.readObject();
        }
        catch (IOException e) {
            Exceptions.throwException(e);
        }
        catch (ClassNotFoundException e) {
            Exceptions.throwException(e);
        }
        finally {
            try {
                if (in != null) {
                    in.close();
                }
            }
            catch (IOException ex) {
                // ignore close exception
            }
        }

        return null;
    }

    // instance data

    @Autowired
    MethodCache methodCache;

    // constructor

    @Autowired
    public DispatchChannel(ChannelManager channelManager) {
        super(channelManager);
    }

    // private

    // implement Channel

    @Override
    public Object invoke(MethodInvocation invocation) {
        Class<?> clazz = invocation.getMethod().getDeclaringClass();
        ServiceRequest request = new ServiceRequest(
                clazz.getName(),
                methodCache.getIndex(clazz, invocation.getMethod()),
                invocation.getArguments()
        );

        try {
            String result = (String)super.invoke(new SimpleMethodInvocation(
                    null,
                    DispatchService.class.getDeclaredMethod("dispatch", String.class),
                    encodeAsString(encodeObject(request))));

            return decodeObject(decodeFromString(result));
        }
        catch (NoSuchMethodException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void setup(Class<com.serious.service.Component> componentClass, List<ServiceAddress> serviceAddresses) {
        super.setup(componentClass, serviceAddresses);
    }
}
