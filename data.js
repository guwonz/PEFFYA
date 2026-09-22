/**
 * STUDY CONTENT — transcribed/mapped from the provided Google Forms PDF.
 */
const STUDY_CONFIG = {
  title: "Political Engagement on Social Media of Filipino Young Adults",

  assessmentUrl: "https://www.cognifit.com/aplicaciones/html5/public/assessment/ASSESSMENT~@~ERIKSEN_FLANKER?testButtonUrl=https://www.cognifit.com%2Fbattery-of-tests%2Feriksen-flanker-task%3Freg%3Dtrue",

  submissionEndpoint: "https://script.google.com/macros/s/AKfycbzMsMPVmpww1K9jLEKvEmiE3I19lOj0fB-yBLj0FUQgG41_Dpq22D8OAP3irv7y9B-v/exec",

  raffleEndpoint: "",

  developmentMode: false
};

const SCALE = {
  agreement: { low: "Strongly Disagree", high: "Strongly Agree" },
  anger: { low: "Not Angry at All", high: "Extremely Angry" }
};

const COPING_DESCRIPTION =
  "Coping refers to the successful managing and dealing with difficult situations, unpleasant emotions, stress, and other similar problems (Cambridge Dictionary). It is the cognitive and behavioral efforts individuals use to manage internal or external demands that they perceive as stressful or exceeding their available resources (Lazarus & Folkman, 1984).";

const POLITICAL_FOLLOWING_OPTIONS = [
  { value: "DDS", label: 'Duterte Diehard Supporters or "DDS"' },
  { value: "KAKAMPINK", label: 'Supporters of Leni Robredo or "Kakampink"' },
  { value: "BBM", label: 'Bongbong Marcos supporters or "BBM"' },
  { value: "NEUTRAL", label: "Neutral or No leaning" }
];

const POST_BRANCHES = {
  BBM: [
    { id: "BBM_1", image: "images/posts/bbm_1.png", alt: "BBM branch social-media post 1" },
    { id: "BBM_2", image: "images/posts/bbm_2.png", alt: "BBM branch social-media post 2" },
    { id: "BBM_3", image: "images/posts/bbm_3.png", alt: "BBM branch social-media post 3" },
    { id: "BBM_4", image: "images/posts/bbm_4.png", alt: "BBM branch social-media post 4" },
    { id: "BBM_5", image: "images/posts/bbm_5.png", alt: "BBM branch social-media post 5" }
  ],
  DDS: [
    { id: "DDS_1", image: "images/posts/dds_1.png", alt: "DDS branch social-media post 1" },
    { id: "DDS_2", image: "images/posts/dds_2.png", alt: "DDS branch social-media post 2" },
    { id: "DDS_3", image: "images/posts/dds_3.png", alt: "DDS branch social-media post 3" },
    { id: "DDS_4", image: "images/posts/dds_4.png", alt: "DDS branch social-media post 4" },
    { id: "DDS_5", image: "images/posts/dds_5.png", alt: "DDS branch social-media post 5" }
  ],
  KAKAMPINK: [
    { id: "KAKAMPINK_1", image: "images/posts/kakampink_1.png", alt: "Kakampink branch social-media post 1" },
    { id: "KAKAMPINK_2", image: "images/posts/kakampink_2.png", alt: "Kakampink branch social-media post 2" },
    { id: "KAKAMPINK_3", image: "images/posts/kakampink_3.png", alt: "Kakampink branch social-media post 3" },
    { id: "KAKAMPINK_4", image: "images/posts/kakampink_4.png", alt: "Kakampink branch social-media post 4" },
    { id: "KAKAMPINK_5", image: "images/posts/kakampink_5.png", alt: "Kakampink branch social-media post 5" }
  ],
  NEUTRAL: [
    { id: "NEUTRAL_1", image: "images/posts/neutral_1.png", alt: "Neutral branch social-media post 1" },
    { id: "NEUTRAL_2", image: "images/posts/neutral_2.png", alt: "Neutral branch social-media post 2" },
    { id: "NEUTRAL_3", image: "images/posts/neutral_3.png", alt: "Neutral branch social-media post 3" },
    { id: "NEUTRAL_4", image: "images/posts/neutral_4.png", alt: "Neutral branch social-media post 4" },
    { id: "NEUTRAL_5", image: "images/posts/neutral_5.png", alt: "Neutral branch social-media post 5" }
  ]
};

const DEBRIEF_TEXT = `To end this questionnaire, we would like to thank you so much for participating in our study and completing this questionnaire. Your time and response will greatly contribute in our study and we gratefully welcome your invaluable participation as a part of our research.

Although it was stated that the objective of this study is to examine how young adults engage with political content on social media, we would like to then declare here the use of deception within our study. In truth, the purpose of the study is to examine how young Filipino adults cognitively appraise rage bait content (i.e., online content created to purposefully incite anger), specifically that of political social media discourse. We would like to apologize for this deception, however it was important for us not to disclose the true purpose of this study in order to avoid preparing you and other participants about what you might encounter within the questionnaire.

In that matter, we would like to ask for you NOT to share this information with other participants or with individuals outside of the study. We assure you that all information and data gathered by this study will be safely kept confidential and used for academic purposes only. We would like to ask for you to extend that courtesy to our future participants and other individuals related to this research.

Should you have any further questions and concerns regarding the study, please feel free to contact this study's head researcher or any of the research group's members. And should you feel like you may need any form of medical or mental assistance, please be directed to the parties and contacts listed in the links below:

National Center for Mental Health
NCMH 24/7 Crisis Hotline: 1553 (Toll-free), 0917-899-8727 (Globe/TM), or 0919-057-1553 (Smart/TNT).
Website: https://ncmh.gov.ph/

In Touch Community Services
In Touch Crisis Hotline: 02-8893-7603 or 0917-800-1123
Website: https://in-touch.org/`;