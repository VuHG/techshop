package com.techshop.shared.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/** Sinh slug từ chuỗi tiếng Việt: bỏ dấu, thường hóa, thay khoảng trắng bằng "-". */
public final class SlugUtil {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern DAU_GACH = Pattern.compile("-{2,}");

    private SlugUtil() {}

    public static String toSlug(String input) {
        if (input == null || input.isBlank()) return "";
        String noWhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(noWhitespace, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace("đ", "d").replace("Đ", "D");
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        slug = DAU_GACH.matcher(slug).replaceAll("-");
        return slug.toLowerCase(Locale.ROOT).replaceAll("^-|-$", "");
    }
}
