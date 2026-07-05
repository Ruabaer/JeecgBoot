-- 清理这批旧菜单与权限关联数据
DELETE FROM sys_permission WHERE id IN ('dcs_folder', 'dcs_test_note', 'dcs_test_note_add', 'dcs_test_note_edit', 'dcs_test_note_del', 'dcs_test_note_del_batch', 'dcs_test_note_export', 'dcs_test_note_import');

-- DCS 目录
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('dcs_folder', NULL, 'DCS示例菜单', '/layouts/default/index', 'layouts/default/index', 1, '', NULL, 0, NULL, 0, 1.00, 0, NULL, 0, 0, 0, 0, NULL, 'admin', '2026-07-05 01:34:29', NULL, NULL, 0, 0, '1', 0);

-- 请假单菜单
INSERT INTO sys_permission(id, parent_id, name, url, component, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_route, is_leaf, keep_alive, hidden, hide_tab, description, status, del_flag, rule_flag, create_by, create_time, update_by, update_time, internal_or_external) 
VALUES ('dcs_test_note', 'dcs_folder', '请假单@JS增强示例', '/dcs/testnote/testNoteList', 'dcs/testnote/TestNoteList', NULL, NULL, 1, NULL, '1', 1.00, 0, NULL, 1, 1, 0, 0, 0, NULL, '1', 0, 0, 'admin', '2026-07-04 18:08:25', NULL, NULL, 0);

-- 新增按钮
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('dcs_test_note_add', 'dcs_test_note', '添加请假单@JS增强示例', NULL, NULL, 0, NULL, NULL, 2, 'org.jeecg.modules.dcs:test_note:add', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-07-04 18:08:25', NULL, NULL, 0, 0, '1', 0);

-- 编辑按钮
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('dcs_test_note_edit', 'dcs_test_note', '编辑请假单@JS增强示例', NULL, NULL, 0, NULL, NULL, 2, 'org.jeecg.modules.dcs:test_note:edit', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-07-04 18:08:25', NULL, NULL, 0, 0, '1', 0);

-- 删除按钮
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('dcs_test_note_del', 'dcs_test_note', '删除请假单@JS增强示例', NULL, NULL, 0, NULL, NULL, 2, 'org.jeecg.modules.dcs:test_note:delete', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-07-04 18:08:25', NULL, NULL, 0, 0, '1', 0);

-- 批量删除按钮
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('dcs_test_note_del_batch', 'dcs_test_note', '批量删除请假单@JS增强示例', NULL, NULL, 0, NULL, NULL, 2, 'org.jeecg.modules.dcs:test_note:deleteBatch', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-07-04 18:08:25', NULL, NULL, 0, 0, '1', 0);

-- 导出按钮
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('dcs_test_note_export', 'dcs_test_note', '导出excel_请假单@JS增强示例', NULL, NULL, 0, NULL, NULL, 2, 'org.jeecg.modules.dcs:test_note:exportXls', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-07-04 18:08:25', NULL, NULL, 0, 0, '1', 0);

-- 导入按钮
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('dcs_test_note_import', 'dcs_test_note', '导入excel_请假单@JS增强示例', NULL, NULL, 0, NULL, NULL, 2, 'org.jeecg.modules.dcs:test_note:importExcel', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-07-04 18:08:25', NULL, NULL, 0, 0, '1', 0);
