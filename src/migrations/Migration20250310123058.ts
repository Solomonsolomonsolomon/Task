import { Migration } from '@mikro-orm/migrations';

export class Migration20250310123058 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`users\` (\`id\` int unsigned not null auto_increment primary key, \`username\` varchar(255) not null, \`email\` varchar(255) not null, \`password\` varchar(255) not null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`tasks\` (\`id\` int unsigned not null auto_increment primary key, \`description\` varchar(255) not null, \`status\` varchar(255) not null default 'active', \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null, \`due_date\` datetime null, \`is_timer_expired\` tinyint(1) not null default false, \`deleted_at\` datetime null, \`user_id\` int unsigned not null, \`reminder_enabled\` tinyint(1) not null default false, \`reminder_time_gap_minutes\` int null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`tasks\` add index \`tasks_user_id_index\`(\`user_id\`);`);

    this.addSql(`alter table \`tasks\` add constraint \`tasks_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`tasks\` drop foreign key \`tasks_user_id_foreign\`;`);

    this.addSql(`drop table if exists \`users\`;`);

    this.addSql(`drop table if exists \`tasks\`;`);
  }

}
