import type { AnalysisResult } from "@/types/analysis";
import type { Language } from "@/lib/i18n/types";

const MOCK_ANALYSIS_EN: AnalysisResult = {
  anxietyScore: 68,
  anxiousPatternAnalysis:
    "Your message shows protest behavior and reassurance-seeking — common when uncertainty spikes after a gap in contact. The tone suggests mind-reading (assuming their silence means disinterest) and urgency to resolve anxiety through immediate reply. This is your attachment system asking for safety, not a character flaw.",
  secureRewrite:
    "Hey — I noticed we haven't connected in a couple of days and I felt a little unsettled. I'm not looking to pressure you; I'd just appreciate a quick check-in when you have space. How are you doing?",
  boundaryStatement:
    "I can tolerate not knowing for a little while without chasing reassurance. My peace doesn't depend on an instant response.",
  suggestedNextAction:
    "Put the phone down for 20 minutes, do something grounding (walk, shower, stretch), then re-read your secure rewrite and send only if it still feels true.",
  whatNotToDo:
    "Avoid double-texting or sending a longer follow-up; don't re-read old messages for hidden meaning; don't make their response speed mean something about your worth.",
};

const MOCK_ANALYSIS_ZH: AnalysisResult = {
  anxietyScore: 68,
  anxiousPatternAnalysis:
    "你的信息显示出抗议行为和寻求安抚的倾向——在联系中断、不确定性上升时这很常见。语气中有读心（把对方的沉默理解为不在乎）以及希望通过立刻得到回复来缓解焦虑。这是你的依恋系统在寻求安全感，而不是性格缺陷。",
  secureRewrite:
    "嗨——我注意到我们已经有几天没联系了，我有点不安。我不是要逼你回复，只是希望你有空时能简单报个平安。你最近怎么样？",
  boundaryStatement:
    "我可以承受短暂的不确定，而不去追逐安抚。我的平静不取决于对方是否立刻回复。",
  suggestedNextAction:
    "先把手机放下 20 分钟，做一件让你落地的事（散步、洗澡、拉伸），再读一遍安全型重写，只有仍觉得真实时才发送。",
  whatNotToDo:
    "避免连环发送或追加更长信息；不要反复读旧消息寻找隐藏含义；不要把回复速度等同于你的价值。",
};

export function getMockAnalysis(language: Language = "en"): AnalysisResult {
  return language === "zh" ? MOCK_ANALYSIS_ZH : MOCK_ANALYSIS_EN;
}
