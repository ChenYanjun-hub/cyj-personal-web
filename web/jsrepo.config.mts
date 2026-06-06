import { defineConfig } from 'jsrepo';
import stripTypes from '@jsrepo/transform-javascript';

export default defineConfig({
    // 第三方组件源（目前只用 reactbits.dev）
    registries: ['https://reactbits.dev/r'],
    // 所有从 reactbits 拉的组件统一装到 src/components/reactbits/
    paths: {
        '*': './src/components/reactbits',
		component: './src/components/reactbits'
    },
    // 我们用 JS-CSS 版本，剥掉类型（reactbits 源文件里的 TS 类型注解去掉）
    transforms: [stripTypes()]
});