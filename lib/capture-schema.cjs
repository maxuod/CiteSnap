const {z}=require('zod');
const id=z.string().min(1).max(120);
const country=z.string().regex(/^[A-Z]{2}$/);
const locale=z.string().regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/);
const timezone=z.string().max(80).refine(v=>{try{new Intl.DateTimeFormat('en',{timeZone:v});return true;}catch{return false;}},'Invalid timezone');
const capturePrivacyMode=z.enum(['signed_out','signed_in_private','signed_in_independent']);
const citation=z.object({url:z.url().refine(v=>['https:','http:'].includes(new URL(v).protocol)),title:z.string().max(500).optional(),placement:z.enum(['answer_link','source_panel']).optional()}).strict();
const captureSchema = z
  .object({
    slotId: id,
    prompt: z.string().min(1).max(10000),
    status: z.enum([
      "observed",
      "not_triggered",
      "unavailable",
      "error",
      "cancelled",
    ]),
    reason: z.string().trim().max(1500).default(""),
    restriction: z
      .enum(["none", "login", "captcha", "rate_limit", "region"])
      .default("none"),
    observedAt: z.iso.datetime({ offset: true }),
    answer: z.string().max(150000).default(""),
    citations: z.array(citation).max(100).default([]),
    model: z.string().max(120).default("unknown"),
    sourceUrl: z
      .url()
      .refine((v) => new URL(v).protocol === "https:", "来源必须是 HTTPS 地址")
      .optional(),
    sessionRef: z.string().max(100).optional(),
    account: z.enum(["logged_out", "logged_in", "unknown"]),
    session: z.enum(["fresh", "active", "unknown"]),
    privacy: z.object({
      mode: capturePrivacyMode,
      temporaryChat: z.enum(["verified", "not_applicable", "unknown"]),
      personalization: z.enum(["disabled", "enabled", "unknown"]),
      newConversation: z.boolean(),
    }).strict().optional(),
    exitCountry: country.nullable().default(null),
    geo: z.enum(["ip_observed", "unverified"]),
    locale,
    timezone,
    device: z.enum(["desktop", "mobile", "tablet", "unknown"]),
    geolocation: z.enum(["denied", "real", "unknown"]),
    searchMode: z.enum(["natural", "explicit_search", "unknown"]),
    collectionMode: z
      .enum(["manual_capture", "browser_capture", "fixture"])
      .default("manual_capture"),
    browser: z.object({
      name: z.literal("Google Chrome"),
      mode: z.enum(["silent", "visible"]).optional(),
      version: z.string().max(100),
      unresolvedCitations: z.number().int().min(0).optional(),
      citationOverflow: z.number().int().min(0).optional(),
      extractorVersion: z.string().max(60),
      answerComplete: z.boolean(),
      citationsComplete: z.boolean(),
      citationControls: z.number().int().min(0).optional(),
      citationControlsOpened: z.number().int().min(0).optional(),
      egress: z.object({country:z.string().regex(/^[A-Z]{2}$/),fingerprint:z.string().regex(/^[a-f0-9]{64}$/),verifiedAt:z.iso.datetime(),provider:z.literal("cloudflare_trace")}).strict().optional(),
      notes: z.array(z.string().max(500)).max(10),
    }).strict().optional(),
    geoVerificationNote: z.string().max(500).optional(),
    retrievalUsed: z.boolean().nullable().default(null),
    artifact: z
      .object({
        mime: z.enum(["image/png", "image/jpeg", "image/webp", "text/plain"]),
        base64: z.string().max(5600000),
      })
      .strict()
      .nullable(),
  })
  .strict()
  .superRefine((c, ctx) => {
    const fail = (message) => ctx.addIssue({ code: "custom", message });
    if (c.status === "observed" && !c.answer.trim()) fail("完整答案需要正文");
    if (c.status !== "observed" && (c.answer || c.citations.length))
      fail("无完整答案时不能填写正文或引用");
    if (c.status !== "observed" && !c.reason) fail("请记录结束原因");
    if (c.status !== "cancelled" && !c.artifact)
      fail("请附上截图或文本原始证据");
    if (c.status === "unavailable" && c.restriction === "none")
      fail("请说明访问限制");
    if (c.status !== "unavailable" && c.restriction !== "none")
      fail("访问限制只适用于无法访问状态");
    if (c.geo === "ip_observed" && !c.exitCountry)
      fail("已核验出口时必须填写国家");
    if (Date.parse(c.observedAt) > Date.now() + 300000)
      fail("观测时间不能在未来");
  });

module.exports={captureSchema};
