import { Migration } from '@mikro-orm/migrations';

export class Migration20250310081456 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`task\` modify \`created_at\` datetime not null default CURRENT_TIMESTAMP, modify \`updated_at\` datetime not null, modify \`is_timer_expired\` tinyint(1) not null default false, modify \`reminder_enabled\` tinyint(1) not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`task\` modify \`created_at\` datetime null default CURRENT_TIMESTAMP, modify \`updated_at\` datetime null, modify \`is_timer_expired\` tinyint(1) null default false, modify \`reminder_enabled\` tinyint(1) null default false;`);
  }

}
