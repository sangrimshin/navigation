export const Constants = {
    // 1시간 동안 이동할 수 있는 거리 = 3.5Km = 350000cm
    WALKING_DISTANCE_PER_HOUR: 350000,
    DIFF_DEGREE: 15,
    UTURN_DEGREE: 169,
    PATH_SIMPLIFY_DISTANCE: 50, // 이동수단이 같더라도 생략 할 수 있는 거리 ( m )
    TRANSCODE: {
        ELEVATOR: 'OB-ELEVATOR',
        ESCALATOR: 'OB-ESCALATOR',
        ESCALATOR_UP: 'OB-ESCALATOR_UP',
        ESCALATOR_DOWN: 'OB-ESCALATOR_DOWN',
        STAIRS: 'OB-STAIRS',
        OTHER: 'OB-OTHER_TRANSPORT',
    },
};
