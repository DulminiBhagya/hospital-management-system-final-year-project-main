package com.HMS.HMS.util;

public final class Sanitizer {
    private Sanitizer() {}

    public static String clean(String s) {
        if (s == null) return null;
        String trimmed = s.trim();
        // collapse multiple spaces; strip control chars
        String collapsed = trimmed.replaceAll("\\s+", " ");
        return collapsed.replaceAll("\\p{Cntrl}", "");
    }
}