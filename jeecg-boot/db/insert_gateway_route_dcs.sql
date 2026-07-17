delete from sys_gateway_route where id = 'jeecg-dcs';
INSERT INTO sys_gateway_route(id, router_id, name, uri, predicates, filters, status, create_by, create_time) 
VALUES ('jeecg-dcs', 'jeecg-dcs', 'jeecg-dcs', 'lb://jeecg-dcs', '[{"args":["/org.jeecg.modules.dcs/**"],"name":"Path"}]', '[]', 1, 'admin', NOW());
