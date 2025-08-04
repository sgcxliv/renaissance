<script>
	export let person = '';
	export let date = '';
	export let place = '';
	export let description = '';
	export let archive = '';
	export let bibliography = '';
	export let eventId = '';
</script>

<div class="popup-content">
	{#if place}
	<h3><strong>{place}</strong></h3>
	{/if}
	
	{#if date}
	<div class="popup-field">
		<strong>Date:</strong> {date}
	</div>
	{/if}
	
	{#if person}
	<div class="popup-field">
		<strong>Person:</strong> {person}
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
</div>

<style>
	.popup-content {
		max-width: 300px;
		line-height: 1.4;
	}
	
	.popup-content h3 {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 1.1rem;
	}
	
	.popup-field {
		margin-bottom: var(--spacing-sm);
	}
	
	.popup-field strong {
		color: var(--primary-color);
	}
</style>