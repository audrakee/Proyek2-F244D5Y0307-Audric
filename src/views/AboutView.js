export function AboutView() {
  const el = document.createElement('section')
  el.className = 'grid'
  el.innerHTML = `
    <h1>About Application</h1>
    <article class="card">
      <p>StoryMap is an SPA application for sharing stories with locations on a digital map. This application was created to fulfill the submission criteria: SPA + transitions, maps with markers and layer controls, adding new data via upload/camera, and good accessibility (alt text, semantic elements, labels, skip links, keyboard-friendly).</p>
    </article>
  `
  return el
}
