import { Support } from "aws-sdk";

const SupportedMailDomains = (process.env.MAIL_DOMAINS ?? "").split(",");

if (!process.env.MAIL_DOMAINS || SupportedMailDomains.length === 0) {
  throw new Error("missing env var process.env.MAIL_DOMAINS");
}

export default SupportedMailDomains;
