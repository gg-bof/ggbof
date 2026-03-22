CREATE TABLE `components` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`is_private` integer DEFAULT false NOT NULL,
	`thumbnail` text,
	`data` text NOT NULL,
	`created_at` integer DEFAULT '"2026-03-05T06:42:00.558Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-03-05T06:42:00.559Z"' NOT NULL
);
