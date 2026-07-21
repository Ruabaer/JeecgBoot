package org.jeecg.config;

import org.jeecg.common.base.BaseMap;
import org.jeecg.handler.LoderRouderHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

/**
 * 网关专用的 Redis 订阅配置（方案 A：通道隔离）
 * 用于订阅网关专用频道 "gateway_redis_topic"，解决非网关服务收到广播时报找不到 Bean 的 WARN 问题。
 */
@Configuration
public class GatewayRedisListenerConfig {

    public static final String GATEWAY_REDIS_TOPIC = "gateway_redis_topic";

    @Autowired
    private LoderRouderHandler loderRouderHandler;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Bean
    public RedisMessageListenerContainer gatewayRedisContainer(RedisConnectionFactory connectionFactory) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        
        container.addMessageListener(new MessageListener() {
            @Override
            public void onMessage(Message message, byte[] pattern) {
                try {
                    // 使用与发送端相同序列化方式反序列化消息体
                    Object body = redisTemplate.getValueSerializer().deserialize(message.getBody());
                    if (body instanceof BaseMap) {
                        loderRouderHandler.onMessage((BaseMap) body);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }, new ChannelTopic(GATEWAY_REDIS_TOPIC));
        
        return container;
    }
}
