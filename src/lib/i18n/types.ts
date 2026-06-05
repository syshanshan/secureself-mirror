export type Language = "en" | "zh";

export interface Translations {
  productName: string;
  productNameShort: string;
  nav: {
    home: string;
    reflect: string;
    history: string;
  };
  footer: {
    privacy: string;
  };
  home: {
    tagline: string;
    intro: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    cta: string;
    closing: string;
  };
  input: {
    title: string;
    subtitle: string;
    situationTitle: string;
    situationSubtitle: string;
    situationPlaceholder: string;
    messageTitle: string;
    messageSubtitle: string;
    messagePlaceholder: string;
    submit: string;
    loading: string;
    errorRequired: string;
    errorGeneric: string;
    errorAnalysisFailed: string;
  };
  result: {
    title: string;
    subtitle: string;
    loading: string;
    notFoundTitle: string;
    notFoundDesc: string;
    notFoundCta: string;
    emotionTitle: string;
    emotionSubtitle: string;
    emotionHint: string;
    patternAnalysis: string;
    secureRewrite: string;
    boundaryStatement: string;
    suggestedNextStep: string;
    relationshipStepTitle: string;
    selfCareStepTitle: string;
    whatNotToDo: string;
    viewOriginal: string;
    situationLabel: string;
    reflectAnother: string;
    viewHistory: string;
    actionCompleteButton: string;
    actionReflectionTitle: string;
    actionReflectionQuestion: string;
    actionReflectionPlaceholder: string;
    actionSaveButton: string;
    actionSaving: string;
    actionCancel: string;
    actionSelectStep: string;
    actionSelectMood: string;
    actionSaveFailed: string;
    actionSavedLocalSyncPending: string;
    actionCompletedTitle: string;
    actionAnxietyBeforeQuestion: string;
    actionAnxietyAfterQuestion: string;
    actionStartButton: string;
    actionInProgressHint: string;
    actionSelectAnxietyBefore: string;
    actionSelectAnxietyAfter: string;
    actionAnxietySummary: string;
    moods: {
      calm: string;
      relaxed: string;
      still_anxious: string;
      sad: string;
      empowered: string;
      clearer: string;
    };
  };
  history: {
    title: string;
    subtitle: string;
    loading: string;
    emptyTitle: string;
    emptyDesc: string;
    emptyCta: string;
    errorLoad: string;
    errorGeneric: string;
    anxietyLabel: string;
    listTitle: string;
    feltThen: string;
    feltAfter: string;
    completedAction: string;
    myReflection: string;
    actionNotCompleted: string;
    viewDetails: string;
    openResult: string;
    noEmotions: string;
    detailSituation: string;
    detailMessage: string;
    detailPattern: string;
    detailRewrite: string;
    detailRelationshipStep: string;
    dashboard: {
      title: string;
      subtitle: string;
      averageScore: string;
      latestScore: string;
      bestScore: string;
      reflectionCount: string;
      progressLabel: string;
      scoreChange: string;
      chartTitle: string;
      trendEmpty: string;
      milestoneTitle: string;
      milestoneCount: string;
      progressValues: {
        improving: string;
        stable: string;
        moreActivated: string;
      };
      insights: {
        improving: string;
        stable: string;
        moreActivated: string;
      };
      milestones: {
        firstPause: string;
        patternAwareness: string;
        securePracticeHabit: string;
        emotionalRegulationStreak: string;
        secureCommunicationBuilder: string;
      };
      actionCompletionCount: string;
      actionCompletionRate: string;
      mostCommonMoodAfter: string;
      latestMoodAfter: string;
      healingInsightsTitle: string;
      mostHelpfulAction: string;
      commonMoodAfter: string;
      myPattern: string;
      aiInsight: string;
      noActionData: string;
      noMoodData: string;
      mostEffectiveActions: string;
      avgAnxietyDrop: string;
    };
  };
  notFound: {
    title: string;
    description: string;
    viewHistory: string;
  };
  copy: {
    copy: string;
    copied: string;
  };
  anxiety: {
    label: string;
    secure: string;
    mild: string;
    anxious: string;
    highlyAnxious: string;
  };
  api: {
    requiredFields: string;
    analysisFailed: string;
    sessionRequired: string;
    historyFailed: string;
  };
}
