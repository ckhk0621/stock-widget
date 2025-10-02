# Stock Widget Placement Guide

## 🎯 Problem: Widget Appearing After Footer

**Issue**: When using auto-create mode, widget appears at end of `<body>` (after footer).

**Cause**: The auto-create feature in `main.jsx` appends to `document.body`, which places it after all content including footer.

---

## ✅ Solutions

### Solution 1: Use Manual Container (Recommended)

**Add the `<div id="stock-widget"></div>` where you want the widget to appear.**

#### For WPCode:

1. **Edit snippet** [wpcode id="560"]
2. **Update Insert Location**:
   - Change from: "Footer"
   - To: "After Post Content" or "Before Post Content"
3. **Update code** to include manual container:

```html
<!-- Widget container - controls placement -->
<div id="stock-widget"></div>

<script>
  window.stockWidgetConfig = {
    symbol: 'MIMI',
    useMock: true,
    theme: 'light'
  };
</script>
<script type="module" crossorigin src="https://stock-widget-five.vercel.app/stock-widget.js?v=2"></script>
<link rel="stylesheet" href="https://stock-widget-five.vercel.app/stock-widget.css?v=2">
```

**Result**: Widget appears in main content area (before footer).

---

### Solution 2: Custom HTML Block (Best Control)

**For specific page placement:**

1. **Edit WordPress page** (page_id=581)
2. **Click "+" to add block** → Search "Custom HTML"
3. **Add Custom HTML block** where you want widget
4. **Paste this code**:

```html
<div id="stock-widget"></div>
<script>
  window.stockWidgetConfig = {
    symbol: 'MIMI',
    useMock: true,
    theme: 'light'
  };
</script>
<script type="module" crossorigin src="https://stock-widget-five.vercel.app/stock-widget.js?v=2"></script>
<link rel="stylesheet" href="https://stock-widget-five.vercel.app/stock-widget.css?v=2">
```

5. **Save/Update page**

**Result**: Widget appears exactly where you placed the Custom HTML block.

---

### Solution 3: Modify Auto-Create Behavior (Advanced)

**If you want auto-create but in different location:**

Modify `src/main.jsx` to insert before footer instead of at end of body:

```javascript
// Instead of:
document.body.appendChild(widgetElement);

// Use:
const footer = document.querySelector('footer');
if (footer) {
  footer.parentNode.insertBefore(widgetElement, footer);
} else {
  document.body.appendChild(widgetElement);
}
```

Then rebuild and redeploy.

---

## 📍 WPCode Insert Locations

| Location | Widget Appears |
|----------|----------------|
| **Before Post Content** | Before main page content |
| **After Post Content** | After main page content, before footer ✅ |
| **Footer** | After footer (end of body) ❌ |
| **Header** | Top of page |
| **Shortcode** | Wherever `[wpcode id="560"]` is placed |

---

## 🎨 Current Page Structure

Based on your page (page_id=581):

```
┌─────────────────────┐
│ Header              │
├─────────────────────┤
│ Main Content        │ ← Widget should be here
│                     │
├─────────────────────┤
│ Footer              │
├─────────────────────┤
│ Widget (wrong!)     │ ← Currently appearing here
└─────────────────────┘
```

**After Fix:**

```
┌─────────────────────┐
│ Header              │
├─────────────────────┤
│ Main Content        │
│ Widget (correct!)   │ ← Widget in right place
├─────────────────────┤
│ Footer              │
└─────────────────────┘
```

---

## ✅ Recommended Fix for Your Site

**Use Custom HTML Block** (easiest and most reliable):

1. Edit page: https://www.mimintinc.com/wp-admin/post.php?post=581&action=edit
2. Add **Custom HTML** block in page content area
3. Paste code from Solution 2 above
4. Update page

**Benefits**:
- ✅ Exact control over placement
- ✅ Widget in main content area (before footer)
- ✅ Easy to move around by dragging block
- ✅ No WPCode location conflicts

---

## 🔍 Debug Placement

To check where widget is rendering:

```javascript
// Run in browser console
const widget = document.getElementById('stock-widget');
console.log('Widget parent:', widget.parentElement.tagName);
console.log('Widget position:', widget.getBoundingClientRect());
```

**Expected**: Parent should be main content container, not `<body>`.

---

## 📋 Quick Reference

**Auto-create mode** (no `<div>`):
- ✅ Easy: Just 3 lines of code
- ❌ Placement: End of body (after footer)
- Use: When footer placement is okay

**Manual container** (`<div id="stock-widget"></div>`):
- ✅ Control: Place anywhere in page
- ✅ Placement: Exactly where you put the div
- Use: When specific placement needed (recommended!)

---

**Next**: Add the `<div id="stock-widget"></div>` to control placement!
