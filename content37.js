/* WORDDAY 3.7.2: interface locale must never rewrite learning content. */
(()=>{'use strict';const L=window.WDLocale37;if(!L)return;
for(const key of ['WDExpressionScenes','WDExpressionExtra','WDExpressionMains','WDExpressionSources','WDExpressionReading','WDExpressionStudioLessons'])L.protectLearning(window[key]);
})();
