import bcrypt from "bcrypt";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function checkPasswork(
  password: string,
  enc_password: string
): Promise<boolean> {
  return await bcrypt.compare(password, enc_password);
}
