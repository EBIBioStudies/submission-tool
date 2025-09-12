import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Authors from '@/components/Authors.vue';
import { nextTick } from 'vue';

describe('Authors.vue', () => {
  const baseSection = {
    subsections: [
      {
        type: 'author',
        accno: 'a1-init',
        attributes: [{ name: 'existing', value: 'val' }],
      },
    ],
  };

  const baseSectionType = {
    name: 'contact',
    columnTypes: [
      { name: 'existing', display: 'required' },
      { name: 'Organisation', display: 'required' },
      { name: 'optionalAttr', display: 'desirable' },
    ],
    hideColumns: false,
  };

  it('renders and adds missing required attributes without duplicates', async () => {
    const wrapper = mount(Authors, {
      props: {
        section: baseSection,
        sectionType: baseSectionType,
      },
    });

    // Access authors computed from component instance
    const authors = wrapper.vm.authors;

    expect(authors.length).toBe(1);
    const attrNames = authors[0].attributes.map((a) => a.name.toLowerCase());

    // Required attributes must be present, organisation added, no duplicates
    expect(attrNames).toContain('existing');
    expect(attrNames).toContain('affiliation');
  });

  it('removes -init suffix from accno', () => {
    const wrapper = mount(Authors, {
      props: {
        section: { ...baseSection }, // a copy to avoid mutation between tests
        sectionType: baseSectionType,
      },
    });

    expect(wrapper.vm.authors[0].accno).toBe('a1'); // '-init' removed
  });

  it('handles OnDeleteOrg event by calling method and updating state', async () => {
    // Setup author with affiliation matching accno to be deleted
    const sectionWithAffiliation = JSON.parse(JSON.stringify(baseSection));
    sectionWithAffiliation.subsections[0].attributes.push({
      name: 'affiliation',
      value: 'some-accno',
    });

    const wrapper = mount(Authors, {
      props: {
        section: sectionWithAffiliation,
        sectionType: baseSectionType,
      },
    });

    // Emit deleteOrg event with accno matching existing affiliation
    await wrapper
      .findComponent({ name: 'SectionTable' })
      .vm.$emit('deleteOrg', {
        accno: 'some-accno',
        authorIndex: 0,
      });

    // Check that affiliation attribute for that org has been removed or cleared
    const attrs = wrapper.vm.authors[0].attributes;
    const affiliationAttr = attrs.find(
      (attr) =>
        attr.name.toLowerCase() === 'affiliation' &&
        attr.value === 'some-accno',
    );
    expect(affiliationAttr).toBeUndefined(); // should be removed
  });

  // Add more tests for other events like OnCreateOrg, reorderAuthors, OnDeleteRow, etc.

  it('adds new organisation and links it as affiliation on OnCreateOrg event', async () => {
    const wrapper = mount(Authors, {
      props: {
        section: JSON.parse(JSON.stringify(baseSection)), // deep clone
        sectionType: baseSectionType,
      },
    });

    // Initial count of organisations
    const initialOrgs = wrapper.vm.section?.subsections?.filter(
      (s) => s.type.toLowerCase() === 'organisation',
    );
    expect(initialOrgs.length).toBe(0);
    await nextTick();

    // Emit createOrg event with new org label and value, simulate adding at authorIndex 0
    await wrapper
      .findComponent({ name: 'SectionTable' })
      .vm.$emit('createOrg', {
        label: 'New Org',
        value: 'https://ror.org/123456',
        authorIndex: 0,
      });

    // Force reactive update
    await nextTick();

    // After event, new organisation should be added
    const organisations = wrapper.vm.section?.subsections?.filter(
      (s) => s.type.toLowerCase() === 'organisation',
    );
    expect(organisations.length).toBe(1);

    // The org added should have the correct name and RORID attribute
    const newOrg = organisations[0];
    expect(newOrg.attributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Name', value: 'New Org' }),
        expect.objectContaining({
          name: 'RORID',
          value: 'https://ror.org/123456',
        }),
      ]),
    );

    // Author's attributes should now include affiliation to the new org accno
    const author = wrapper.vm.authors[0];
    const affiliation = author.attributes.find(
      (attr) =>
        attr.name.toLowerCase() === 'affiliation' &&
        attr.value === newOrg.accno,
    );
    expect(affiliation).toBeDefined();
    expect(affiliation.reference).toBe(true);

    // Author should have 3 attributes
    const attrNames = author.attributes.map((e) => e.name);

    expect(attrNames.length).toBe(3);
    expect(attrNames).toStrictEqual([
      'existing',
      'optionalAttr',
      'affiliation',
    ]);
  });
});
