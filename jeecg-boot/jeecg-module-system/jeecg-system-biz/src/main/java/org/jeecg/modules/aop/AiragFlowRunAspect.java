package org.jeecg.modules.aop;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.yomahub.liteflow.flow.FlowBus;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.jeecg.common.util.oConvertUtils;
import org.jeecg.modules.airag.flow.entity.AiragFlow;
import org.jeecg.modules.airag.flow.vo.api.FlowDebugParams;
import org.jeecg.modules.airag.flow.vo.api.FlowRunParams;
import org.jeecg.modules.airag.flow.vo.flow.config.FlowNode;
import org.jeecg.modules.airag.flow.component.code.CodeNode;
import org.jeecg.modules.airag.flow.service.IAiragFlowService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Spring Aspect to dynamically register script nodes and reload LiteFlow chains
 * on flow execution and debugging, resolving cache/clustering mismatch issues.
 */
@Aspect
@Component
public class AiragFlowRunAspect {

    private static final Logger log = LoggerFactory.getLogger(AiragFlowRunAspect.class);

    @Pointcut("execution(* org.jeecg.modules.airag.flow.service.a.b.runFlow(..)) || execution(* org.jeecg.modules.airag.flow.service.a.b.debugFlow(..))")
    public void flowExecutionPointCut() {}

    @Around("flowExecutionPointCut()")
    public Object aroundRunFlow(ProceedingJoinPoint joinPoint) throws Throwable {
        log.info("[AiragFlowRunAspect] Intercepted runFlow/debugFlow execution!");
        Object[] args = joinPoint.getArgs();
        if (args.length > 0 && args[0] instanceof FlowRunParams) {
            FlowRunParams params = (FlowRunParams) args[0];
            
            AiragFlow airagFlow = null;
            if (params instanceof FlowDebugParams) {
                airagFlow = ((FlowDebugParams) params).getFlow();
            }
            
            if (airagFlow == null) {
                String flowId = params.getFlowId();
                if (oConvertUtils.isNotEmpty(flowId)) {
                    IAiragFlowService flowService = (IAiragFlowService) joinPoint.getTarget();
                    airagFlow = flowService.getById(flowId);
                }
            }
            
            if (airagFlow != null && oConvertUtils.isNotEmpty(airagFlow.getDesign())) {
                try {
                    log.info("[AiragFlowRunAspect] Processing flow design for ID: {}", airagFlow.getId());
                    JSONObject designJson = JSONObject.parseObject(airagFlow.getDesign());
                    JSONArray nodes = designJson.getJSONArray("nodes");
                    if (nodes != null) {
                        for (int i = 0; i < nodes.size(); i++) {
                            JSONObject nodeJson = nodes.getJSONObject(i);
                            if ("code".equals(nodeJson.getString("type"))) {
                                FlowNode flowNode = nodeJson.toJavaObject(FlowNode.class);
                                log.info("[AiragFlowRunAspect] Dynamically registering script node: {}", flowNode.getId());
                                CodeNode.a(flowNode);
                            }
                        }
                    }
                    
                    log.info("[AiragFlowRunAspect] Reloading chain: {}", airagFlow.getId());
                    FlowBus.reloadChain(airagFlow.getId(), airagFlow.getChain());
                } catch (Exception e) {
                    log.error("[AiragFlowRunAspect] Failed to dynamically register nodes or reload chain", e);
                }
            }
        }
        
        return joinPoint.proceed();
    }
}
