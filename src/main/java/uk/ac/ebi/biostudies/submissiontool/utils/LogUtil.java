package uk.ac.ebi.biostudies.submissiontool.utils;

public class LogUtil {

  private LogUtil() {
  }

  public static String sanitizeForLog(String value) {
    if (value == null) {
      return null;
    }
    return value.replaceAll("[\\p{Cntrl}]", "_");
  }
}
