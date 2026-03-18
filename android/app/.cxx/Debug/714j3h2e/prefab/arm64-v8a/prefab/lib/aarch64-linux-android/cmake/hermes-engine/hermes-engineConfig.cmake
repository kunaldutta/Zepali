if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/Users/kunaldutta/.gradle/caches/9.0.0/transforms/683c56a152ec03a455990ff82514c0a1/transformed/hermes-android-250829098.0.9-debug/prefab/modules/hermesvm/libs/android.arm64-v8a/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/kunaldutta/.gradle/caches/9.0.0/transforms/683c56a152ec03a455990ff82514c0a1/transformed/hermes-android-250829098.0.9-debug/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

