from apps.bluebottle_utils.tests import BlogPostCreationMixin
from django.test import TestCase
from rest_framework import status


class ReactionApiIntegrationTest(BlogPostCreationMixin, TestCase):
    """
    Integration tests for the Reaction API.
    """
    # TODO: Add a test for reaction on another type of content.

    def setUp(self):
        self.blogpost = self.create_blogpost()
        self.api_base = '/i18n/api/blogs/'
        self.reaction_api_name = '/reactions/'
        self.reactions_url = "{0}{1}{2}".format(self.api_base, self.blogpost.slug, self.reaction_api_name)
        self.client.login(username=self.blogpost.author.username, password='password')

    def tearDown(self):
        self.client.logout()

    def test_reaction_crud(self):
        """
        Tests for creating, retrieving, updating and deleting a reaction.
        """

        # Create reaction.
        reaction_text = 'Great job!'
        response = self.client.post(self.reactions_url, {'reaction': reaction_text})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data['reaction'], reaction_text)

        # Retrieve reaction.
        reaction_detail_url = "{0}{1}".format(self.reactions_url, str(response.data['id']))
        response = self.client.get(reaction_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['reaction'], reaction_text)

        # Update reaction.
        new_reaction_text = 'This is a really nice post.'
        response = self.client.put(reaction_detail_url, {'reaction': new_reaction_text})
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['reaction'], new_reaction_text)

        # Delete reaction.
        response = self.client.delete(reaction_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT, response)


    def test_reactions_on_multiple_objects(self):
        """
        Tests for multiple reactions and unauthorized reaction updates.
        """

        # Create two reactions.
        reaction_text_1 = 'Great job!'
        response = self.client.post(self.reactions_url, {'reaction': reaction_text_1})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data['reaction'], reaction_text_1)

        reaction_text_2 = 'This is a really nice post.'
        response = self.client.post(self.reactions_url, {'reaction': reaction_text_2})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data['reaction'], reaction_text_2)

        # Check the size of the reaction list is correct.
        response = self.client.get(self.reactions_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['count'], 2)

        # Create a reaction on second blog post.
        second_blogpost = self.create_blogpost(title='Ben Jij Rijk?')
        second_reactions_url = "{0}{1}{2}".format(self.api_base, second_blogpost.slug, self.reaction_api_name)
        reaction_text_3 = 'Super!'
        response = self.client.post(second_reactions_url, {'reaction': reaction_text_3})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data['reaction'], reaction_text_3)
        # Save the detail url to be used in the authorization test below.
        second_reaction_detail_url = "{0}{1}".format(second_reactions_url, response.data['id'])

        # Check that the size and data in the first reaction list is correct.
        response = self.client.get(self.reactions_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(response.data['results'][1]['reaction'], reaction_text_1)
        self.assertEqual(response.data['results'][0]['reaction'], reaction_text_2)

        # Check that the size and data in the second reaction list is correct.
        response = self.client.get(second_reactions_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['reaction'], reaction_text_3)

        # Test that a reaction update from a user who is not the author is forbidden.
        self.client.logout()
        self.client.login(username=second_blogpost.author.username, password='password')
        response = self.client.post(second_reaction_detail_url, {'reaction': 'Can I update this reaction?'})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED, response.data)
