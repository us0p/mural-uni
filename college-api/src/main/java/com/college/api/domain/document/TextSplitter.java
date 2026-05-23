package com.college.api.domain.document;

import java.util.List;

public interface TextSplitter {
    List<String> split(String text);
}
