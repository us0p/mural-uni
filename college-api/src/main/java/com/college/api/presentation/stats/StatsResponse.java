package com.college.api.presentation.stats;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record StatsResponse(
        @JsonProperty("semester_event_count") long semesterEventCount,
        @JsonProperty("job_post_count")       long jobPostCount,
        @JsonProperty("connected_students")   long connectedStudents,
        @JsonProperty("latest_news")          String latestNews
) {}
