# Toko Matcha

A single-page site for Toko Matcha, a matcha shop in Kukusan, Beji, Depok.

It is built for one visitor in particular: someone who taps the link in an
Instagram or TikTok bio, on a phone, on patchy data, and wants to know three
things before deciding whether the trip is worth it. What the drink looks
like, what it costs, and where the shop is. All of it inside one scroll.

![Toko Matcha](assets/og-image.jpg)

## Live site

https://toko-matcha-beta.vercel.app/

## Running it locally

The site is static, so there is nothing to install and nothing to build. It
does have to be served over HTTP, though. Open `index.html` straight off disk
as a `file://` URL and the stylesheet and images will not resolve, leaving you
with unstyled text.

```bash
python -m http.server 8765
```

Then open <http://localhost:8765>.

## Stack

Hand-written HTML, CSS and vanilla JavaScript, with no framework and no
bundler anywhere in it. The only thing the page fetches from outside is the
Google Fonts stylesheet, which carries Archivo and Playfair Display.

* `index.html` is the whole page, markup and all.
* `styles.css` is the whole stylesheet, with the custom properties up top.
* `script.js` runs the scroll choreography, the flavour picker and the mobile menu.
* `assets/` holds the photography and icons.
* `DESIGN.md` and `PRODUCT.md` record the thinking behind both.

## Notes

Animations are gated behind a `.js` class that the page sets on `<html>`
before anything else loads. If the script fails, nothing is left hidden
mid-fade. Reduced-motion preferences are honoured throughout, including when
someone changes the setting with the page already open.

The large photographs are WebP. Every `<img>` carries its real `width` and
`height`, so the layout holds its shape while the images are still arriving.

The site is deployed on Vercel at `toko-matcha-beta.vercel.app`. If the
address ever changes (a custom domain, say), update it in `index.html` in the
`rel="canonical"` link and the `og:image` and `twitter:image` tags, and fix the
live-site URL at the top of this file. Social previews need an absolute URL. A
relative one silently produces a link with no image at all.

## License

The source code is MIT, and `LICENSE` has the text. That covers `index.html`,
`styles.css` and `script.js` only. The photographs in `assets/`, along with the
Toko Matcha name and logo, are not covered by it and stay all rights reserved.
