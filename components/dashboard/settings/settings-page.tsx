import { Monitor, ShieldCheck, Bell } from "lucide-react";
import ThemeToggleWithIcon from "@/components/toggle";

type SettingsPageProps = {
  title: string;
  description: string;
  roleNoteTitle: string;
  roleNotes: string[];
};

export function DashboardSettingsPage({
  title,
  description,
  roleNoteTitle,
  roleNotes,
}: SettingsPageProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">Giao diện</h2>
            <p className="text-sm text-muted-foreground">
              Chuyển đổi giữa chế độ sáng và tối. Cài đặt được lưu trên trình duyệt hiện tại.
            </p>
          </div>
        </div>

        <ThemeToggleWithIcon />
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">{roleNoteTitle}</h2>
            <p className="text-sm text-muted-foreground">
              Khu vực này là khung mở rộng cho cài đặt theo vai trò.
            </p>
          </div>
        </div>

        <ul className="space-y-3">
          {roleNotes.map((note) => (
            <li key={note} className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
              {note}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
            <Bell className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-card-foreground">Thông báo</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Mục cài đặt thông báo sẽ được bổ sung trong phiên bản tiếp theo.
        </p>
      </section>
    </div>
  );
}
