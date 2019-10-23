# WebP in CSS

<img src="https://ai.github.io/webp-in-css/webp-logo.svg" align="right"
     alt="WebP logo" width="150" height="180">

[PostCSS] plugin and tiny JS script (128 bytes) to use [WebP] in CSS `background`.

This tool will make your images [25% smaller] for Chrome, Firefox, and Edge.
Safari will download the bigger JPEG/PNG image.

You add `require('webp-in-css')` to your JS bundle and write CSS like:

```css
.logo {
  width: 30px;
  height: 30px;
  background: url(/logo.png);
}
```

The script will set `webp` or `no-webp` class on `<body>`
and PostCSS plugin will generates:

```css
.logo {
  width: 30px;
  height: 30px;
}
body.webp .logo {
  background: url(/logo.webp);
}
body.no-webp .logo {
  background: url(/logo.png);
}
```

[25% smaller]: https://developers.google.com/speed/webp/docs/webp_lossless_alpha_study#results
[PostCSS]: https://github.com/postcss/postcss
[WebP]: https://en.wikipedia.org/wiki/WebP

<a href="https://evilmartians.com/?utm_source=webp-in-css">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>


## Usage

**Step 1:** convert all your JPEG/PNG images to WebP by [Squoosh].
Set checkbox on `Lossless` for PNG images and remove it for JPEG.

We recommend `Reduce palette` for most of the PNG images.

Save WebP images in the same places of JPEG/PNG images:
`img/bg.png` → `img/bg.webp`.

**Step 2:** use `<picture>` to insert WebP images in HTML:

```diff html
- <img src="/screenshot.jpg" alt="Screenshot">
+ <picture>
+   <source srcset="/screenshot.webp" type="image/webp">
+   <img src="/screenshot.jpg" alt="Screenshot">
+ </picture>
```

**Step 3:** install `webp-in-css`. For npm use:

```sh
npm install --save-dev webp-in-css
```

For Yarn:

```sh
yarn add --dev webp-in-css
```

**Step 4:** add JS script to your client-side JS bundle:

```diff js
+ require('webp-in-css')
```

Since JS script is very small (128 bytes), the best way for landings
is to inline it to HTML:

```diff html
+   <script><%= readFile('node_modules/webp-in-css/index.js') %></script>
  </head>
```

**Step 5:** check do you use PostCSS already in your bundler.
You can check `postcss.config.js` in the project root,
`"postcss"` section in `package.json` or `postcss` in bundle config.

If you don’t have it already, add PostCSS to your bundle:

* For webpack see [postcss-loader] docs.
* For Parcel create `postcss.config.js` file.
  It already has PostCSS support.
* For Gulp check [gulp-postcss] docs.

**Step 5:** Add `webp-in-css/plugin` to PostCSS plugins:

```diff js
module.exports = {
  plugins: [
+   require('webp-in-css/plugin'),
    require('autoprefixer')
  ]
}
```

We also recommend to put all images from CSS to preload content:

```diff html
+   <link rel="preload" as="image" type="image/webp" href="/logo.webp">
    <script><%= readFile('node_modules/webp-in-css/index.js') %></script>
  </head>
```

[postcss-loader]: https://github.com/postcss/postcss-loader#usage
[gulp-postcss]: https://github.com/postcss/gulp-postcss
[Squoosh]: https://squoosh.app/


## 介绍

这篇文章主要针对 WEBP 调研进行一个整理并最终给出一个基于 webpack 的 WEBP 落地方案

## 使用 webp 格式的理由

1. `刷新一个页面消耗的流量除了脚本样式文件以外，大头其实在下载的图片。一张图片动辄几十kb，想尽办法优化样式、脚本文件所优化的图片流量其实还不如一张图片大` (复制网上, 需要改动)
2. 个人工作内容主要是西山居游戏对我游戏网站建设与活动专题开发, 图片在页面中资源大小占比为 40 ~ 50%

## 图片占比度

根据http档案馆，截至2008年11月，图片平均占网页总重量的21%..所以说到

在WebP中的无损透明编码

在 PNG 的表现中, [我们表明WebP是PNG的一个很好的替代品，无论在大小和处理速度方面都可以在Web上使用. Webp 比 PNG更快的解码速度，并且比使用今天的PNG格式所能达到的压缩密度高23%](https://developers.google.com/speed/webp/docs/webp_lossless_alpha_study)

格式化图像的主要目标是查找最低文件大小和可接受质量之间的平衡..执行几乎所有这些优化的方法不止一种。最流行的方法之一是在上传到WordPress之前简单地压缩它们。通常，这可以在AdobePhotoshop或亲和图片这样的工具中完成。其中一些任务也可以使用插件执行，我们将在下面进一步介绍。

## webp 格式支持度

1. 根据 [caniuse](https://www.caniuse.com/#search=webp) 数据, 截止文章发布(19年6月) Webp 支持度达 78.81%, PC 端 81.11%, 移动端 78.75%.
2. 工作中在移动端落地数据表明, 支持度均值达 78.7%

## webp 文件名规则

webpack 中出于缓存考虑, 常使用 [name]-[hash:6].[ext], bg.png 生成后(推导)为 bg-8js91k.png, 此时需要生成 webp 并给该资源命名并最终落盘, 但不应使用以下命名方案:

1. 命名方案1: bg.png => bg.webp, 这种转换方式不直观, 无法通过 bg.webp <br />
2. 命名方案2: bg.png => bg.png.webp, 这种形式个人在京东淘宝中见过, 好处是能够快速通过 bg.png.webp `推导原图图片名` 为 bg.png, bg.png 也可以直接加
上 '.webp' `推导Webp图片名` bg.png.webp, 但如果遇到 images/avatar.webp 图片命名时, 难以直接推导该图是否是使用当前文章 webp 方案生成, 若错误的去除 '.webp' 后
缀, 页面会无法下载资源 'images/avatar' 而包 404 错误.

生成 Webp 后应加入 `相互推导` 后缀 `.x.webp`, 通过约定命名 `.x.webp`, png 和 webp 能够互相推导. 由于哈希值 `8js91k` (bg-8js91k.png) 目的是为了唯一标识
图片 `bg.png`, 所以使用约定后缀 `.x.webp` 时也可使用 `bg-8js91k.png.x.webp` 作为最终命名.

## 生成规则

经过 webpack loader, 对于外部资源涵盖 css 中的 background-image: url(bg.png), 最终都会被作为 `require('bg.png')` 的方式并被 `toWebp-loader` 进行解析,
采取与 url-loader 同等策略, **对于小于 limit (e.g. 10K) 时转换成 base64**. 与 url-loader 不同的是, `toWebp-loader` 在处理图片 `bg.png` 的同时也应生成
相应的 webp 图片. 考虑到有且只有一张图片 (png 或 webp) 会被使用, 所以也有且理应只有一张图片应被转换成 base64, 否者最终 webpack 生成的 css 必然过大同时也失去
了资源大小优化的初衷

考虑到目前 webp 支持度近 80%, 所以在使用 `toWebp-loader` 内部机制如下: 

1. 获取图片 bg.png Buffer
2. 使用 `imagemin``对 bg.png 进行压缩
3. 将压缩的 bg.png 转换成 webp 格式并按照约定的规则生成

## 前言
与JPEG相同，WebP是一种有损压缩。但谷歌表示，这种格式的主要优势在于高效率。他们发现，“在质量相同的情况下，WebP格式图像的体积要比JPEG格式图像小40%。谷歌浏览器已经支持webp格式，Opera在版本号Opera11.10后也增加了支持，然而火狐和ie暂时还不支持webp格式，可以采用flash插件来显示webp，当然这样会耗费一些性能。

https://groups.google.com/a/webmproject.org/forum/#!msg/webp-discuss/0GmxDmlexek/3ggyYsaYdFEJ

## 参考
* https://developers.google.com/speed/webp/ (google webp)
* https://developers.google.com/speed/webp/docs/webp_study
* https://segmentfault.com/a/1190000008764613

#### ChangeLog

## 0.1.0 (2019-10-23)

* feat: 优先 webp 转成 base64, 由于埋点统计数据发现 95% 的移动端用户都支持 webp 格式

## 0.1.0 (2019-10-19)

* feat: 完成大部分测试并正式对外
