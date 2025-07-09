<script>
	export let person = '';
	export let date = '';
	export let place = '';
	export let description = '';
	export let archive = '';
	export let bibliography = '';
	export let eventId = '';
	
	function sharePoint() {
		const shareId = eventId.replace('EV:', '');
		const shareURL = `${window.location.origin}/?eventid=${shareId}`;
		navigator.clipboard.writeText(shareURL);
		
		// Show a brief confirmation (optional)
		alert('Link copied to clipboard!');
	}
</script>

<div class="popup-content">
	{#if person}
	<div class="popup-field">
		<strong>Person:</strong> {person}
	</div>
	{/if}
	
	{#if date}
	<div class="popup-field">
		<strong>Date:</strong> {date}
	</div>
	{/if}
	
	{#if place}
	<div class="popup-field">
		<strong>Place:</strong> {place}
	</div>
	{/if}
	
	{#if description}
	<div class="popup-field">
		<strong>Description:</strong> {description}
	</div>
	{/if}
	
	{#if archive}
	<div class="popup-field">
		<strong>Archival Document:</strong> {@html archive}
	</div>
	{/if}
	
	{#if bibliography}
	<div class="popup-field">
		<strong>Bibliography:</strong> {@html bibliography}
	</div>
	{/if}
	
	<div class="popup-actions">
		<button class="share-button" on:click={sharePoint}>
			<img src="/images/share_24.svg" alt="Share" />
			<span>Copy link</span>
		</button>
	</div>
</div>

<style>
	.popup-content {
		max-width: 300px;
		line-height: 1.4;
	}
	
	.popup-field {
		margin-bottom: var(--spacing-sm);
	}
	
	.popup-field strong {
		color: var(--primary-color);
	}
	
	.popup-actions {
		margin-top: var(--spacing-md);
		padding-top: var(--spacing-sm);
		border-top: 1px solid var(--border-color);
	}
	
	.share-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-color);
		font-size: var(--font-sm);
		padding: 0;
	}
	
	.share-button:hover {
		color: var(--primary-color);
	}
	
	.share-button img {
		width: 16px;
		height: 16px;
	}
</style>