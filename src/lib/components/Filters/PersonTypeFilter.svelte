<script>
  import { filters } from '$lib/stores/filters.js';

  // Color samples for the legend
  const personTypes = [
    { key: 'showComposers', label: 'Composers', color: '#440154' },
    { key: 'showMusicians', label: 'Musicians', color: '#23ed5c' },
    { key: 'showNonMusicians', label: 'Non-musicians', color: '#fde725' }
  ];
</script>

<div class="checkbox-container">
  {#each personTypes as type}
    <div class="checkbox-item">
      <input 
        type="checkbox" 
        id="{type.key}-select"
        bind:checked={$filters[type.key]}
      />
      <label for="{type.key}-select">
        <span class="color-sample" style="background-color: {type.color};"></span>
        {type.label}
      </label>
    </div>
  {/each}
</div>

<style>
  .checkbox-container {
    display: flex;
    flex-direction: column;
    gap: 1px;
    position: relative;
  }

  .checkbox-item {
    display: flex;
    align-items: center;
  }

  .checkbox-item label {
    margin-left: 5px;
    white-space: nowrap;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .checkbox-item input[type="checkbox"] {
    cursor: pointer;
  }

  .small-space {
    height: 20px;
  }

  .color-sample {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 5px;
    vertical-align: middle;
  }

  @media (max-width: 768px) {
    .checkbox-container {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .small-space {
      display: none;
    }
    
    .checkbox-item {
      flex: 1;
      min-width: 150px;
    }
  }
</style>