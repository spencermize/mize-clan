<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "DialogPrompt",
  data: () => ({
    active: false,
    value: null
  }),
  methods: {
	save: function(){
		this.$emit('change-user',this.value)
	}
  }
});
</script>
<template>
  <div>
    <md-dialog-prompt
      :md-active="true"
      v-model="value"
      md-title="Welcome to MizeClan Chat"
      md-input-maxlength="30"
      md-input-placeholder="Type your name..."
      md-confirm-text="Done"
	  v-on:md-confirm="save"
    />
  </div>
</template>