import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// 開発用: AUTH_DISABLED=1 のとき認証をバイパスしダミーユーザーを注入
// 本番運用では必ず AUTH_DISABLED を未設定/0 にすること。

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	canActivate(context: ExecutionContext) {
		if (process.env.AUTH_DISABLED === "1") {
			const req = context.switchToHttp().getRequest();
			// 既に user があっても上書きしない（他ガードと干渉回避）
			if (!req.user) {
				req.user = {
					userId: "dev-admin",
					email: "dev-admin@example.com",
					role: "ADMIN",
				};
			}
			return true;
		}
		return super.canActivate(context);
	}
}
