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
    whatNotToDo: string;
    viewOriginal: string;
    situationLabel: string;
    reflectAnother: string;
    viewHistory: string;
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
