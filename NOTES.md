## Known issues/improvements

- [ ] Replace onMouseDown handler with a long-press handler
- [ ] Mobile animation is still very janky
- [ ] Replace the droppable cursor
- [ ] Split out more components from `DraggablePhoto` component
- [ ] General style improvement (e.g. overlay opacity, animation timings)
- [ ] Clean up the animations into variants
- [ ] Clean up all inline styles
- [ ] Move types and helpers to separate files

# Implementation notes

Due to the time constraints, I've made a few decisions that might not have been the most optimal. I'm going to elaborate this below as part of the implementation details.

> I've also sprinkled in some small fixes here and there after the submissions (there's a few things I got wrong in the initial submissions, particularly the math & coordinates xD) - all of these can be seen in the commits.

## Assumptions

- Image urls are unique

## Image States & Transitions

Each image can be in one of three states

- Default
- Rippling image A onto B
- Fading image A onto B

To give the general idea of how the states transition work, here's how it might play out:

```typescript
// Given this array of images (the string represents the default state here for conciseness)
const initial = ["imgA", "imgB", "imgC", "imgD"];

// after dropping imgB on imgD
const swapping = ["imgA", fade(D, B), "imgC", ripple(B, D)];

// after the animation is played
const swapped = ["imgA", "imgD", "imgC", "imgB"];
```

> Note that in the implementation this is not exactly what's stored in the state. We store the entry as is along with the `swapping` state. Then, we derive these transition states based on the `swapping` state. You can see this on `PrintPage.tsx`.

## Animation details

All these states are jammed into `DraggablePhoto` component at the moment as I didn't have time for a clean up - sorry about that! But here are the general explanations.

### Default

In this state, no animation will be played until the image is dragged.

When the drag starts, there are two parts at play:

- Long-press handler (shown here as mouse down for now)
  - The drag image shows up at the spot of the click with a bounce-in animation
  - The white ripple animation is played from the spot of the click
- Drag-start handler
  - The drag image is added to the event's [DataTransfer](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer)'s drag image via `setDragImage` API
    - For some reason, this doesn't work on Safari yet. This would be the first thing I investigate if I have more time
  - The image url is passed as part of the DataTransfer too.

The approach I took here is to have **two separate drag images**; one for when mouse down, and one to be passed into `setDragImage` API. As a result, if you look for it, you might be able to see a slight stutter when you transition from mouse-down to dragging. The possible improvement here is probably to just not use the `setDragImage` API and move the drag image with the mouse manually, but that also comes with its own tediousness not suitable for a timed challenge like this, so I settled for this.

> The is-dragging state and is-dragging-over state are tracked as the local state. It might be possible to track this on the state like the other ones but as these states only involve the image itself, I think we should be fine with the local state.

### Rippling image A onto image B

It's quite hard to name this state :joy:, but it's basically a state right after another image is dropped on the existing image. **This is meant to be a transient state** - this state will only stay for the duration of the animation.

To support the animation, this state needs a few more things

```typescript
{
  state: "replacing-ripple";
  originalImageUrl: string;
  replacementImageUrl: string;
  // might not be the best naming here, but it's meant to state the coordinate the image was dropped
  dropX: number;
  dropY: number;
}
```

The drop coordinates are needed here because upon the image being dropped, we need to play two animations:

1. Moving the drag image from the drop coordinates to the center of the container
2. Scale up the circle of the drag image until the whole image is on top of the original image

Just like before, I also went with the two-elements approach here. The reason is because it's easier given the time constraint, and the drag image's style is slightly different. Specifically, the image on the first step is scaled-down, while the image on the 2nd step is not scaled at all. So it's simpler to separate them, and it's probably less noticeable given the animation speed. With that said, there's probably a way to do this with one element too.

Another thing worth noting is that, due to how the image scaling is done using the circle-over-the-div (as opposed to masking), it's much easier to implement when the dimensions of the images are explicit to the component. Hence, \*\*`width` and `height` are part of the props of `DraggablePhoto` component.

### Fading image A onto image B

This is relatively simple, but as this was one of the later things I got to, I didn't get to do much to make this optimal (you can see how I went with two div there when it's easily doable with one div). :see_no_evil: But yeah, not much to say here. **This is also a transient state that should on exist until the animation is done playing.**

---

## FAQ

> Why is the image rendered using the div + css background instead of img

At one point, I was trying to animate the rippling-up using a single div, which ended up not looking like what I wanted. After that, I didn't have time to update so here it is :see_no_evil:

> Is there anything else I probably should have mentioned here?

Quite likely. I'm writing this note at almost midnight so chances are I'm definitely missing something. Might update this later if I thought of something else.
