import { UserRole } from "@prisma/client";
import { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        email: string;
      };
      file?: Multer.File;
    }
  }
}
