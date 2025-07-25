<script lang="ts">
  import { backOut, cubicInOut } from "svelte/easing";
  import { onMount } from "svelte";
  import { flyAndScale, reveal, revealWords } from "$lib/utils";
  import { fade, fly, scale } from "svelte/transition";
  import confetti from "canvas-confetti";
  import { pb } from "$lib";
  import { ClientResponseError } from "pocketbase";

  let mounted = $state(false);
  let email = $state("");
  let waitlistCount = $state(0);
  let alreadySignedUp = $state(false);
  let isSigningUp = $state(false);

  let { headline, subline } = $props();

  let sublineIndex = 0;
  let sublines = [
    "The cursor for bookmarks.",
    "An open source manager for creatives and professionals.",
    "Bringing joy back to bookmarking.",
    "From chaos to clarity — one link at a time.",
    "Tame your tabs. Master your mind.",
    "Blazingly fast. Surprisingly simple.",
    "AI that remembers what you forget.",
    "Clutter-free by design.",
    "No vendor lock-in. Ever.",
    "Where bookmarks feel like second nature.",
    "One place for everything you want to revisit.",
    "Save now, find faster.",
    "Built for flow, not friction.",
    "A calm place for your internet thoughts.",
    "Lightweight, like it should be.",
    "Because the browser wasn't made for memory.",
    "Less chaos. More clarity.",
    "You think in links. So do we.",
    "Minimal UI, maximal focus.",
    "The fastest way to remember anything online.",
    "A notebook that thinks in URLs.",
    "Bookmarks, but beautiful.",
    "Forget folders. Embrace flow.",
    "Privacy-first, purpose-built.",
    "Not another tab manager. A link companion.",
    "For when reading list just isn’t enough.",
  ];

  headline = Math.floor(Math.random() * 3) + 1;

  onMount(async () => {
    mounted = true;
    try {
      const res = await fetch(pb.baseURL + "api/waitlist-members");
      if (res.ok) {
        const count = await res.json();
        waitlistCount = typeof count === "number" ? count : 0;
      } else {
        waitlistCount = 0;
        console.error("Failed to fetch waitlist members");
      }
    } catch (err) {
      waitlistCount = 0;
      console.error("Error fetching waitlist members", err);
    }

    if (
      typeof window !== "undefined" &&
      localStorage.getItem("dotpen:waitlist") === "true"
    ) {
      alreadySignedUp = true;
    }

    sublineIndex = Math.floor(Math.random() * sublines.length);
    subline = sublines[sublineIndex];

    setInterval(() => {
      subline = "";
      setTimeout(() => {
        sublineIndex = (sublineIndex + 1) % sublines.length;
        subline = sublines[sublineIndex];
      }, 1000);
    }, 4000);
  });

  async function joinWaitlist(e: Event) {
    e.preventDefault();
    isSigningUp = true;
    console.info("[waitlist] Joining waitlist");
    if (email) {
      alreadySignedUp = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("dotpen:waitlist", "true");
      }

      try {
        await pb.collection("waitlist").create({
          email,
        });

        waitlistCount += 1;
      } catch (error) {
        if (error instanceof ClientResponseError) {
          console.error("[waitlist] Error creating waitlist entry", error);
          if (
            error.cause &&
            typeof error.cause === "object" &&
            "data" in error.cause &&
            error.cause.data &&
            typeof error.cause.data === "object" &&
            "data" in error.cause.data &&
            error.cause.data.data &&
            typeof error.cause.data.data === "object" &&
            "email" in error.cause.data.data &&
            error.cause.data.data.email &&
            typeof error.cause.data.data.email === "object" &&
            "code" in error.cause.data.data.email &&
            error.cause.data.data.email.code === "validation_not_unique"
          ) {
            console.error("[waitlist] Email already in waitlist");
          }
        }
      }

      email = "";
      isSigningUp = false;

      confetti({
        particleCount: 250,
        spread: 75,
        colors: ["#646986", "#dcc8a6", "#0e422a"],
      });
    }
  }
</script>

{#if mounted && headline}
  <content
    class="h-full w-full flex flex-col justify-center items-center gap-6 px-4"
  >
    <p
      transition:reveal={{ duration: 150 * headline.split(" ").length }}
      class="text-4xl sm:text-4xl md:text-5xl sm:text-nowrap lg:text-6xl italic font-medium text-black/45 text-center leading-tight"
    >
      {#if headline === 1}
        Bookmarking, <span class="text-black">reimagined.</span>
      {:else if headline === 2}
        Beyond <span class="text-black">bookmarks</span>.
      {:else if headline === 3}
        The web, <span class="text-black">organized.</span>
      {/if}
    </p>

    <div
      class="h-[1.75rem] sm:h-[1.875rem] md:h-[2rem] -mt-3 flex items-center justify-center"
    >
      {#key subline}
        <p
          aria-label={subline}
          class="italic text-sm sm:text-lg md:text-xl text-center font-medium text-black/65 max-w-xl"
          in:revealWords={{
            duration: 100 * subline.split(" ").length,
            direction: "down",
          }}
          out:revealWords={{ duration: 650 }}
        >
          {subline}
        </p>
      {/key}
    </div>

    <form
      onsubmit={joinWaitlist}
      in:scale={{ delay: 400, duration: 150, start: 0.8, opacity: 0 }}
      class="flex justify-center items-center mt-2 md:mt-4 outline backdrop-brightness-95 outline-black/10 dark:outline-white/10 transition-all duration-100 h-10 sm:h-11 md:h-12 w-full max-w-xs sm:max-w-sm md:w-96 rounded-xl md:rounded-2xl px-3"
    >
      <input
        bind:value={email}
        class="outline-0 border-0 bg-transparent focus:ring-0 w-full h-full transition-all duration-300 placeholder:opacity-70 focus:placeholder:opacity-50 text-sm md:text-base"
        placeholder="Email"
        autocomplete="off"
      />
      <div class="grid">
        {#if !isSigningUp}
          <button
            type="submit"
            class="bg-black hover:bg-black/80 active:bg-black/70 active:scale-98 text-white text-light font-sans px-3 rounded-xl cursor-pointer py-1 text-nowrap"
            in:fly={{ y: 10, duration: 650, easing: backOut }}
          >
            Join waitlist
          </button>
        {:else}
          <button
            type="submit"
            class="bg-black text-white opacity-65 text-light font-sans px-3 rounded-xl cursor-not-allowed py-1 text-nowrap"
            in:fly={{ y: -10, duration: 650, easing: backOut }}
          >
            Loading
          </button>
        {/if}
      </div>
    </form>

    <div
      in:fade={{ duration: 650, delay: 500, easing: cubicInOut }}
      class="-mt-3 text-nowrap opacity-65 text-xs flex items-center justify-center gap-2"
    >
      <div class="bg-green-600 rounded-full size-2 animate-pulse"></div>
      {#if alreadySignedUp}
        You're in – along with {waitlistCount - 1} other awesome folks!
      {:else}
        {waitlistCount} awesome people have already joined.
      {/if}
    </div>

    <img
      in:flyAndScale={{ y: 100, duration: 500, delay: 0 }}
      src="/assets/img1.png"
      alt="Dotpen Preview"
      class="md:block md:w-[80%] max-w-7.5xl absolute xl:-bottom-12 bottom-0 hidden"
    />
    <img
      src="/assets/img1+mobile.png"
      alt="Dotpen Preview"
      class="w-[95%] rounded-xl h-80 object-cover absolute bottom-0 md:hidden"
    />
  </content>
{/if}
