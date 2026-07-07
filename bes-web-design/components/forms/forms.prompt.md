**BPC form fields** — `Input`, `Textarea`, `Select`. Hairline-bordered, hard-edged controls with an eyebrow-style all-caps label. Focus raises the border to charcoal — no glow, no heavy shadow.

```jsx
<Input label="Full name" placeholder="Jane Dain" />
<Input label="Email" type="email" invalid />
<Textarea label="Tell us about your property" rows={5} />
<Select label="State" options={["Queensland", "New South Wales", "Victoria"]} />
```

Use the `label` prop for the tracked uppercase caption above each field. `invalid` keeps the border charcoal to flag an error without color. Keep forms quiet — these are enquiry forms for a premium audience, not dense dashboards.
